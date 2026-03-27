const express = require('express');
const router = express.Router();
const { 
  createQuiz, 
  getAllQuizzes, 
  getQuizById, 
  submitQuiz, 
  deleteQuiz 
} = require('../controllers/quizController');
const { protect } = require('../middleware/auth');
const { authorize } = require('../middleware/role');

router.use(protect);

router.post('/', authorize('teacher', 'admin'), createQuiz);
router.get('/', getAllQuizzes);
router.get('/:id', getQuizById);
router.post('/:id/submit', authorize('student'), submitQuiz);
router.delete('/:id', authorize('teacher', 'admin'), deleteQuiz);

module.exports = router;
