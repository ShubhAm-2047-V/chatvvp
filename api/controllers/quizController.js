const Quiz = require('../models/Quiz');
const Activity = require('../models/Activity');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Teacher/Admin)
const createQuiz = async (req, res) => {
  const { title, description, subject, branch, year, questions } = req.body;

  if (!title || !subject || !branch || !year || !questions || questions.length === 0) {
    return res.status(400).json({ message: 'Please provide all required fields and at least one question' });
  }

  try {
    const quiz = await Quiz.create({
      teacherId: req.user._id,
      title,
      description,
      subject,
      branch,
      year: Number(year),
      questions
    });

    res.status(201).json({
      message: 'Quiz created successfully',
      quiz
    });
  } catch (error) {
    console.error('Create Quiz Error:', error);
    res.status(500).json({ message: 'Error creating quiz', error: error.message });
  }
};

// @desc    Get all quizzes (filtered by student profile if student)
// @route   GET /api/quizzes
// @access  Private
const getAllQuizzes = async (req, res) => {
  try {
    const { role, branch, year } = req.user;
    let query = {};

    if (role === 'student') {
      query = {
        branch: { $regex: new RegExp(`^${branch}$`, 'i') },
        year: Number(year)
      };
    }

    const quizzes = await Quiz.find(query).sort({ createdAt: -1 });
    res.status(200).json(quizzes);
  } catch (error) {
    console.error('Get All Quizzes Error:', error);
    res.status(500).json({ message: 'Error fetching quizzes', error: error.message });
  }
};

// @desc    Get quiz by ID
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.status(200).json(quiz);
  } catch (error) {
    console.error('Get Quiz By ID Error:', error);
    res.status(500).json({ message: 'Error fetching quiz', error: error.message });
  }
};

// @desc    Submit quiz results
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
const submitQuiz = async (req, res) => {
  const { answers } = req.body; // Array of selectedOptionIndex
  
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    const results = quiz.questions.map((q, index) => {
      const isCorrect = q.correctOptionIndex === answers[index];
      if (isCorrect) score++;
      return {
        questionId: q._id,
        isCorrect,
        correctOptionIndex: q.correctOptionIndex,
        selectedOptionIndex: answers[index],
        explanation: q.explanation
      };
    });

    const finalScore = {
      score,
      totalQuestions: quiz.questions.length,
      percentage: (score / quiz.questions.length) * 100
    };

    // Record activity
    await Activity.create({
      user: req.user._id,
      type: 'take_quiz',
      refId: quiz._id,
      topic: quiz.title,
      subject: quiz.subject,
      metadata: { 
        score: finalScore.score,
        total: finalScore.totalQuestions,
        percentage: finalScore.percentage
      }
    });

    res.status(200).json({
      message: 'Quiz submitted successfully',
      results,
      finalScore
    });
  } catch (error) {
    console.error('Submit Quiz Error:', error);
    res.status(500).json({ message: 'Error submitting quiz', error: error.message });
  }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Teacher/Admin)
const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

    // Only creator or admin can delete
    if (quiz.teacherId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await quiz.deleteOne();
    res.status(200).json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete Quiz Error:', error);
    res.status(500).json({ message: 'Error deleting quiz', error: error.message });
  }
};

module.exports = {
  createQuiz,
  getAllQuizzes,
  getQuizById,
  submitQuiz,
  deleteQuiz
};
