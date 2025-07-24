import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query, validationResult } from 'express-validator';
import { asyncHandler, createError } from '../middleware/errorHandler';

const router = express.Router();
const prisma = new PrismaClient();

// ===== SOURCES =====

// Get all sources
router.get('/sources', asyncHandler(async (req, res) => {
  const sources = await prisma.source.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(sources);
}));

// Create source
router.post('/sources', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, description } = req.body;

  // Check if source already exists
  const existingSource = await prisma.source.findFirst({
    where: { name }
  });

  if (existingSource) {
    throw createError('Source already exists', 400);
  }

  const source = await prisma.source.create({
    data: {
      name,
      description: description || null,
      userId: 'test-user', // Temporary for testing
    },
  });

  res.status(201).json(source);
}));

// Update source
router.put('/sources/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if source exists
  const existingSource = await prisma.source.findFirst({
    where: { id }
  });

  if (!existingSource) {
    throw createError('Source not found', 404);
  }

  const source = await prisma.source.update({
    where: { id },
    data: {
      name,
      description: description || null,
    },
  });

  res.json(source);
}));

// Delete source
router.delete('/sources/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if source exists
  const source = await prisma.source.findFirst({
    where: { id }
  });

  if (!source) {
    throw createError('Source not found', 404);
  }

  await prisma.source.delete({
    where: { id },
  });

  res.status(204).send();
}));

// ===== CATEGORIES =====

// Get all categories
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(categories);
}));

// Create category
router.post('/categories', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, description } = req.body;

  // Check if category already exists
  const existingCategory = await prisma.category.findFirst({
    where: { name }
  });

  if (existingCategory) {
    throw createError('Category already exists', 400);
  }

  const category = await prisma.category.create({
    data: {
      name,
      description: description || null,
      userId: 'test-user', // Temporary for testing
    },
  });

  res.status(201).json(category);
}));

// Update category
router.put('/categories/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if category exists
  const existingCategory = await prisma.category.findFirst({
    where: { id }
  });

  if (!existingCategory) {
    throw createError('Category not found', 404);
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      name,
      description: description || null,
    },
  });

  res.json(category);
}));

// Delete category
router.delete('/categories/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if category exists
  const category = await prisma.category.findFirst({
    where: { id }
  });

  if (!category) {
    throw createError('Category not found', 404);
  }

  await prisma.category.delete({
    where: { id },
  });

  res.status(204).send();
}));

// ===== SUBCATEGORIES =====

// Get subcategories by category
router.get('/subcategories', asyncHandler(async (req, res) => {
  const { categoryId } = req.query;

  const where: any = {};
  if (categoryId) {
    where.categoryId = categoryId;
  }

  const subcategories = await prisma.subcategory.findMany({
    where,
    include: {
      category: { select: { id: true, name: true } }
    },
    orderBy: { name: 'asc' },
  });
  res.json(subcategories);
}));

// Create subcategory
router.post('/subcategories', [
  body('name').notEmpty().withMessage('Name is required'),
  body('categoryId').notEmpty().withMessage('Category ID is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, categoryId, description } = req.body;

  // Check if category exists
  const category = await prisma.category.findFirst({
    where: { id: categoryId }
  });

  if (!category) {
    throw createError('Category not found', 404);
  }

  // Check if subcategory already exists
  const existingSubcategory = await prisma.subcategory.findFirst({
    where: { name, categoryId }
  });

  if (existingSubcategory) {
    throw createError('Subcategory already exists', 400);
  }

  const subcategory = await prisma.subcategory.create({
    data: {
      name,
      description: description || null,
      categoryId,
      userId: 'test-user', // Temporary for testing
    },
    include: {
      category: { select: { id: true, name: true } }
    }
  });

  res.status(201).json(subcategory);
}));

// Update subcategory
router.put('/subcategories/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if subcategory exists
  const existingSubcategory = await prisma.subcategory.findFirst({
    where: { id }
  });

  if (!existingSubcategory) {
    throw createError('Subcategory not found', 404);
  }

  const subcategory = await prisma.subcategory.update({
    where: { id },
    data: {
      name,
      description: description || null,
    },
    include: {
      category: { select: { id: true, name: true } }
    }
  });

  res.json(subcategory);
}));

// Delete subcategory
router.delete('/subcategories/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if subcategory exists
  const subcategory = await prisma.subcategory.findFirst({
    where: { id }
  });

  if (!subcategory) {
    throw createError('Subcategory not found', 404);
  }

  await prisma.subcategory.delete({
    where: { id },
  });

  res.status(204).send();
}));

// ===== PROJECTS =====

// Get all projects
router.get('/projects', asyncHandler(async (req, res) => {
  const projects = await prisma.project.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(projects);
}));

// Create project
router.post('/projects', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, description } = req.body;

  // Check if project already exists
  const existingProject = await prisma.project.findFirst({
    where: { name }
  });

  if (existingProject) {
    throw createError('Project already exists', 400);
  }

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      userId: 'test-user', // Temporary for testing
    },
  });

  res.status(201).json(project);
}));

// Update project
router.put('/projects/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if project exists
  const existingProject = await prisma.project.findFirst({
    where: { id }
  });

  if (!existingProject) {
    throw createError('Project not found', 404);
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      name,
      description: description || null,
    },
  });

  res.json(project);
}));

// Delete project
router.delete('/projects/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if project exists
  const project = await prisma.project.findFirst({
    where: { id }
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  await prisma.project.delete({
    where: { id },
  });

  res.status(204).send();
}));

// ===== PHASES =====

// Get phases by project
router.get('/phases', asyncHandler(async (req, res) => {
  const { projectId } = req.query;

  const where: any = {};
  if (projectId) {
    where.projectId = projectId;
  }

  const phases = await prisma.phase.findMany({
    where,
    include: {
      project: { select: { id: true, name: true } }
    },
    orderBy: { name: 'asc' },
  });
  res.json(phases);
}));

// Create phase
router.post('/phases', [
  body('name').notEmpty().withMessage('Name is required'),
  body('projectId').notEmpty().withMessage('Project ID is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, projectId, description } = req.body;

  // Check if project exists
  const project = await prisma.project.findFirst({
    where: { id: projectId }
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  // Check if phase already exists
  const existingPhase = await prisma.phase.findFirst({
    where: { name, projectId }
  });

  if (existingPhase) {
    throw createError('Phase already exists', 400);
  }

  const phase = await prisma.phase.create({
    data: {
      name,
      description: description || null,
      projectId,
      userId: 'test-user', // Temporary for testing
    },
    include: {
      project: { select: { id: true, name: true } }
    }
  });

  res.status(201).json(phase);
}));

// Update phase
router.put('/phases/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if phase exists
  const existingPhase = await prisma.phase.findFirst({
    where: { id }
  });

  if (!existingPhase) {
    throw createError('Phase not found', 404);
  }

  const phase = await prisma.phase.update({
    where: { id },
    data: {
      name,
      description: description || null,
    },
    include: {
      project: { select: { id: true, name: true } }
    }
  });

  res.json(phase);
}));

// Delete phase
router.delete('/phases/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if phase exists
  const phase = await prisma.phase.findFirst({
    where: { id }
  });

  if (!phase) {
    throw createError('Phase not found', 404);
  }

  await prisma.phase.delete({
    where: { id },
  });

  res.status(204).send();
}));

// ===== FILE FORMATS =====

// Get all file formats
router.get('/formats', asyncHandler(async (req, res) => {
  const formats = await prisma.fileFormat.findMany({
    orderBy: { name: 'asc' },
  });
  res.json(formats);
}));

// Create file format
router.post('/formats', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, description } = req.body;

  // Check if format already exists
  const existingFormat = await prisma.fileFormat.findFirst({
    where: { name }
  });

  if (existingFormat) {
    throw createError('File format already exists', 400);
  }

  const format = await prisma.fileFormat.create({
    data: {
      name,
      description: description || null,
      userId: 'test-user', // Temporary for testing
    },
  });

  res.status(201).json(format);
}));

// Update file format
router.put('/formats/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if format exists
  const existingFormat = await prisma.fileFormat.findFirst({
    where: { id }
  });

  if (!existingFormat) {
    throw createError('File format not found', 404);
  }

  const format = await prisma.fileFormat.update({
    where: { id },
    data: {
      name,
      description: description || null,
    },
  });

  res.json(format);
}));

// Delete file format
router.delete('/formats/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Check if format exists
  const format = await prisma.fileFormat.findFirst({
    where: { id }
  });

  if (!format) {
    throw createError('File format not found', 404);
  }

  await prisma.fileFormat.delete({
    where: { id },
  });

  res.status(204).send();
}));

export default router; 