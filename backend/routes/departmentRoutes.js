const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);

// View departments: all staff
router.get('/', departmentController.getDepartments);
router.get('/:id', departmentController.getDepartmentById);

// Create / Update / Delete departments: Administrator only
router.post('/', authorize('Administrator'), departmentController.createDepartment);
router.put('/:id', authorize('Administrator'), departmentController.updateDepartment);
router.delete('/:id', authorize('Administrator'), departmentController.deleteDepartment);

module.exports = router;
