const request = require('supertest');
const app = require('../src/index');
const jwt = require('jsonwebtoken');

describe('Sample Test', () => {
  let id;
  const sector = {
    name: 'enfermagem',
    description: 'setor de enfermagem',
  };

  const sector1 = {
    name: 'setor um',
    description: 'setor número um',
  };

  const sector2 = {
    name: 'setor dois',
    description: 'setor número dois',
  };

  const sector3 = {
    name: 'setor três',
    description: 'setor número três',
  };

  const sector4 = {
    name: 'setor quatro',
    description: 'setor número quatro',
  };

  const sector5 = {
    name: 'setor cinco',
    description: 'setor número cinco',
  };

  const token = jwt.sign({ name: "Teste", description: "Teste" }, process.env.SECRET, {
    expiresIn: 240,
  });


  beforeAll(async () => {
    await request(app).post('/sector/create').set('x-access-token', token).send(sector1);
    await request(app).post('/sector/create').set('x-access-token', token).send(sector2);
    await request(app).post('/sector/create').set('x-access-token', token).send(sector3);
    await request(app).post('/sector/create').set('x-access-token', token).send(sector4);
    await request(app).post('/sector/create').set('x-access-token', token).send(sector5);
  })


  it('App is defined', (done) => {
    expect(app).toBeDefined();
    done();
  });

  it('Get newest four sectors', async (done) => {
    const res = await request(app).get('/sector/newest-four').set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.length).toBe(4);
    done();
  });

  // sector/create
  it('Post sector', async (done) => {
    const res = await request(app).post('/sector/create').set('x-access-token', token).send(sector);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(sector.name);
    expect(res.body.description).toBe(sector.description);
    id = res.body._id;
    done();
  });

  it('Post sector error', async (done) => {
    const errorSector = {
      name: '',
      description: '',
    };

    const res = await request(app).post('/sector/create').set('x-access-token', token).send(errorSector);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual(['invalid name', 'invalid description']);
    done();
  });

  // sector
  it('Get sector', async (done) => {
    const res = await request(app).get('/sector/').set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    done();
  });

  // sector/:id
  it('Get id sector', async (done) => {
    const res = await request(app).get(`/sector/${id}`).set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(sector.name);
    expect(res.body.description).toBe(sector.description);
    done();
  });

  it('Get id sector error', async (done) => {
    const res = await request(app).get('/sector/12345678912345678912345').set('x-access-token', token);
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toBe("Invalid ID");
    done();
  });

  // sector/update/:id
  it('Update sector', async () => {
    const sector = {
        name: "fisioterapia",
        description: "setor de fisioterapia"
    };

    const res = await request(app)
    .put(`/sector/update/${id}`)
    .set('x-access-token', token)
    .send(sector);
    expect(res.statusCode).toBe(200);
    expect(res.body.name).toBe(sector.name);
    expect(res.body.description).toBe(sector.description);
});

// Invalido
it('Update sector error', async () => {
    const sector = {
        name: "",
        description: "Jest description"
    }

    const res = await request(app)
    .put(`/sector/update/${id}`)
    .set('x-access-token', token)
    .send(sector);
    expect(res.statusCode).toBe(400);
    expect(res.body.status).toEqual([ 'invalid name' ]);
});

it('Update with invalid id', async () => {
    const sector = {
        name: "fisioterapia",
        description: "setor de fisioterapia"
    };

    const res = await request(app)
    .put(`/sector/update/123abc`)
    .set('x-access-token', token)
    .send(sector)
    expect(res.statusCode).toBe(400);
    expect(res.body.err).toBe('invalid id')
});

it('Update sector without token', async () => {
    const sector = {
        name: "Jest test",
        description: "Jest description"
    }

    const res = await request(app)
    .put(`/sector/update/${id}`)
    .send(sector);
    expect(res.statusCode).toBe(401);
    expect(res.body).toEqual({ auth: false, message: 'No token was provided' });
});

it('Update sector with invalid token', async () => {
    const tokenFalho = 'abc123';
    const sector = {
        name: "Jest test",
        description: "Jest description"
    }

    const res = await request(app)
    .put(`/sector/update/${id}`)
    .set('x-access-token', tokenFalho)
    .send(sector);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ auth: false, message: 'It was not possible to authenticate the token.' });
});

it('Delete sector', async (done) => {
    const res = await request(app).delete(`/sector/delete/${id}`).set('x-access-token', token)
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({"message":"success"});
    done();
  });

  it('Delete sector error', async (done) => {
    const res = await request(app).del('/sector/delete/09876543210987654321').set('x-access-token', token)
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({"message":"failure"});
    done();
  });
});

afterAll(async (done) => {
  done();
});
