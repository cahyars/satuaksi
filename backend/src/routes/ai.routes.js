const router = require('express').Router();
const { generatePrediction, getPredictions, getMyPredictions, aiChat, getTewsGempa, getNationalWeather } = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.post('/predict', generatePrediction);
router.get('/predictions', getPredictions);
router.get('/my-predictions', getMyPredictions);
router.post('/chat', aiChat);
router.get('/tews-gempa', getTewsGempa);
router.get('/weather-national', getNationalWeather);

module.exports = router;

