
/**
 * Copyright (c) 2026 Driving Training Center Hang Ha
 * (Trung tâm đào tạo lái xe Hằng Hà)
 *
 * All rights reserved.
 */

const sheetsService = require('../services/sheetsService');

// Fetch all exam questions
exports.getExamQuestions = async (req, res) => {
    try {
        const questions = await sheetsService.getQuestions();
        res.status(200).json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching exam questions', error });
    }
};

// Submit exam results
exports.submitExamResults = async (req, res) => {
    const { userId, answers } = req.body;
    try {
        const result = await sheetsService.saveExamResults(userId, answers);
        res.status(201).json({ message: 'Exam results submitted successfully', result });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting exam results', error });
    }
};

// Additional functions for managing exams can be added here as needed.