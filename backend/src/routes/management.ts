import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query, validationResult } from 'express-validator';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { requireUser, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// ===== SOURCES =====

// Get all sources
router.get('/sources', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const sources = await prisma.source.findMany({
    where: { userId: req.user!.id },
    orderBy: { name: 'asc' },
  });
  res.json(sources);
}));

// Create source
router.post('/sources', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, description } = req.body;

  // Check if source already exists for this user
  const existingSource = await prisma.source.findFirst({
    where: { 
      name,
      userId: req.user!.id
    }
  });

  if (existingSource) {
    throw createError('Source already exists', 400);
  }

  const source = await prisma.source.create({
    data: {
      name,
      description: description || null,
      userId: req.user!.id,
    },
  });

  res.status(201).json(source);
}));

// Update source
router.put('/sources/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if source exists and belongs to user
  const existingSource = await prisma.source.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
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
router.delete('/sources/:id', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if source exists and belongs to user
  const source = await prisma.source.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
  });

  if (!source) {
    throw createError('Source not found', 404);
  }

  // Check if source is used by any chats
  const chatCount = await prisma.chat.count({
    where: { sourceId: id }
  });

  if (chatCount > 0) {
    throw createError('Cannot delete source that is used by chats', 400);
  }

  await prisma.source.delete({
    where: { id }
  });

  res.json({ message: 'Source deleted successfully' });
}));

// ===== CATEGORIES =====

// Get all categories
router.get('/categories', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const categories = await prisma.category.findMany({
    where: { userId: req.user!.id },
    orderBy: { name: 'asc' },
  });
  res.json(categories);
}));

// Create category
router.post('/categories', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, description } = req.body;

  // Check if category already exists for this user
  const existingCategory = await prisma.category.findFirst({
    where: { 
      name,
      userId: req.user!.id
    }
  });

  if (existingCategory) {
    throw createError('Category already exists', 400);
  }

  const category = await prisma.category.create({
    data: {
      name,
      description: description || null,
      userId: req.user!.id,
    },
  });

  res.status(201).json(category);
}));

// Update category
router.put('/categories/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if category exists and belongs to user
  const existingCategory = await prisma.category.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
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
router.delete('/categories/:id', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if category exists and belongs to user
  const category = await prisma.category.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
  });

  if (!category) {
    throw createError('Category not found', 404);
  }

  // Check if category is used by any chats
  const chatCount = await prisma.chat.count({
    where: { categoryId: id }
  });

  if (chatCount > 0) {
    throw createError('Cannot delete category that is used by chats', 400);
  }

  await prisma.category.delete({
    where: { id }
  });

  res.json({ message: 'Category deleted successfully' });
}));

// ===== SUBCATEGORIES =====

// Get subcategories by category
router.get('/subcategories', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { categoryId } = req.query;

  const where: any = { userId: req.user!.id };
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
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, categoryId, description } = req.body;

  // Check if category exists and belongs to user
  const category = await prisma.category.findFirst({
    where: { 
      id: categoryId,
      userId: req.user!.id
    }
  });

  if (!category) {
    throw createError('Category not found', 404);
  }

  // Check if subcategory already exists for this category
  const existingSubcategory = await prisma.subcategory.findFirst({
    where: { 
      name,
      categoryId,
      userId: req.user!.id
    }
  });

  if (existingSubcategory) {
    throw createError('Subcategory already exists', 400);
  }

  const subcategory = await prisma.subcategory.create({
    data: {
      name,
      description: description || null,
      categoryId,
      userId: req.user!.id,
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
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if subcategory exists and belongs to user
  const existingSubcategory = await prisma.subcategory.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
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
router.delete('/subcategories/:id', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if subcategory exists and belongs to user
  const subcategory = await prisma.subcategory.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
  });

  if (!subcategory) {
    throw createError('Subcategory not found', 404);
  }

  // Check if subcategory is used by any chats
  const chatCount = await prisma.chat.count({
    where: { subcategoryId: id }
  });

  if (chatCount > 0) {
    throw createError('Cannot delete subcategory that is used by chats', 400);
  }

  await prisma.subcategory.delete({
    where: { id }
  });

  res.json({ message: 'Subcategory deleted successfully' });
}));

// ===== PROJECTS =====

// Get all projects
router.get('/projects', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const projects = await prisma.project.findMany({
    where: { userId: req.user!.id },
    orderBy: { name: 'asc' },
  });
  res.json(projects);
}));

// Create project
router.post('/projects', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, description } = req.body;

  // Check if project already exists for this user
  const existingProject = await prisma.project.findFirst({
    where: { 
      name,
      userId: req.user!.id
    }
  });

  if (existingProject) {
    throw createError('Project already exists', 400);
  }

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      userId: req.user!.id,
    },
  });

  res.status(201).json(project);
}));

// Update project
router.put('/projects/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if project exists and belongs to user
  const existingProject = await prisma.project.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
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
router.delete('/projects/:id', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if project exists and belongs to user
  const project = await prisma.project.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  // Check if project is used by any chats
  const chatCount = await prisma.chat.count({
    where: { projectId: id }
  });

  if (chatCount > 0) {
    throw createError('Cannot delete project that is used by chats', 400);
  }

  await prisma.project.delete({
    where: { id }
  });

  res.json({ message: 'Project deleted successfully' });
}));

// ===== PHASES =====

// Get phases by project
router.get('/phases', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { projectId } = req.query;

  const where: any = { userId: req.user!.id };
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
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, projectId, description } = req.body;

  // Check if project exists and belongs to user
  const project = await prisma.project.findFirst({
    where: { 
      id: projectId,
      userId: req.user!.id
    }
  });

  if (!project) {
    throw createError('Project not found', 404);
  }

  // Check if phase already exists for this project
  const existingPhase = await prisma.phase.findFirst({
    where: { 
      name,
      projectId,
      userId: req.user!.id
    }
  });

  if (existingPhase) {
    throw createError('Phase already exists', 400);
  }

  const phase = await prisma.phase.create({
    data: {
      name,
      description: description || null,
      projectId,
      userId: req.user!.id,
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
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if phase exists and belongs to user
  const existingPhase = await prisma.phase.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
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
router.delete('/phases/:id', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if phase exists and belongs to user
  const phase = await prisma.phase.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
  });

  if (!phase) {
    throw createError('Phase not found', 404);
  }

  // Check if phase is used by any chats
  const chatCount = await prisma.chat.count({
    where: { phaseId: id }
  });

  if (chatCount > 0) {
    throw createError('Cannot delete phase that is used by chats', 400);
  }

  await prisma.phase.delete({
    where: { id }
  });

  res.json({ message: 'Phase deleted successfully' });
}));

// ===== FILE FORMATS =====

// Get all file formats
router.get('/formats', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const formats = await prisma.fileFormat.findMany({
    where: { userId: req.user!.id },
    orderBy: { name: 'asc' },
  });
  res.json(formats);
}));

// Create file format
router.post('/formats', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { name, description } = req.body;

  // Check if format already exists for this user
  const existingFormat = await prisma.fileFormat.findFirst({
    where: { 
      name,
      userId: req.user!.id
    }
  });

  if (existingFormat) {
    throw createError('File format already exists', 400);
  }

  const format = await prisma.fileFormat.create({
    data: {
      name,
      description: description || null,
      userId: req.user!.id,
    },
  });

  res.status(201).json(format);
}));

// Update file format
router.put('/formats/:id', [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').optional().isString().withMessage('Description must be a string'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const { name, description } = req.body;

  // Check if format exists and belongs to user
  const existingFormat = await prisma.fileFormat.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
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
router.delete('/formats/:id', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if format exists and belongs to user
  const format = await prisma.fileFormat.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
  });

  if (!format) {
    throw createError('File format not found', 404);
  }

  // Check if format is used by any chats
  const chatCount = await prisma.chat.count({
    where: { formatId: id }
  });

  if (chatCount > 0) {
    throw createError('Cannot delete file format that is used by chats', 400);
  }

  await prisma.fileFormat.delete({
    where: { id }
  });

  res.json({ message: 'File format deleted successfully' });
}));

export default router; 