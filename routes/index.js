import express from 'express';
import AppController from '../controllers/AppController';

// Endpoint of the API

const controllingRouters = ((app) => {
  const router = express.Router();
  app.use('/', router);

  // Route to get the status, should return the status of the API
  router.get('/status', (req, res) => {
    AppController.getStatus(req, res);
  });

  // Route to the stats, should return the stats API
  router.get('/status', (req, res) => {
    AppController.getStat(req, res);
  });
});

export default controllingRouters;
