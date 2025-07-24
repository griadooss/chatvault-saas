import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, query, validationResult } from 'express-validator';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { requireUser, AuthenticatedRequest } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import archiver from 'archiver';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.md', '.txt', '.html'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only .md, .txt, and .html files are allowed.'));
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  }
});

// Get all chats with filtering and pagination
router.get('/', [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().withMessage('Search must be a string'),
  query('categoryId').optional().isString().withMessage('Category ID must be a string'),
  query('sourceId').optional().isString().withMessage('Source ID must be a string'),
  query('projectId').optional().isString().withMessage('Project ID must be a string'),
  query('startDate').optional().isISO8601().withMessage('Start date must be valid ISO date'),
  query('endDate').optional().isISO8601().withMessage('End date must be valid ISO date'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string;
  const categoryId = req.query.categoryId as string;
  const sourceId = req.query.sourceId as string;
  const projectId = req.query.projectId as string;
  const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
  const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    userId: req.user!.id // Multi-tenant isolation
  };
  
  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
      { content: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (categoryId) where.categoryId = categoryId;
  if (sourceId) where.sourceId = sourceId;
  if (projectId) where.projectId = projectId;
  
  if (startDate || endDate) {
    where.chatDate = {};
    if (startDate) where.chatDate.gte = startDate;
    if (endDate) where.chatDate.lte = endDate;
  }

  // Get chats and total count
  const [chats, totalCount] = await Promise.all([
    prisma.chat.findMany({
      where,
      skip,
      take: limit,
      orderBy: { chatDate: 'desc' },
      include: {
        source: { select: { id: true, name: true } },
        category: { select: { id: true, name: true } },
        subcategory: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        phase: { select: { id: true, name: true } },
        format: { select: { id: true, name: true } },
        user: { select: { id: true, firstName: true, lastName: true } },
      },
    }),
    prisma.chat.count({ where }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  res.json({
    chats,
    pagination: {
      currentPage: page,
      totalPages,
      totalCount,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  });
}));

// Get single chat
router.get('/:id', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  const chat = await prisma.chat.findFirst({
    where: { 
      id,
      userId: req.user!.id // Multi-tenant isolation
    },
    include: {
      source: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      subcategory: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      phase: { select: { id: true, name: true } },
      format: { select: { id: true, name: true } },
      user: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!chat) {
    throw createError('Chat not found', 404);
  }

  res.json(chat);
}));

// Create new chat
router.post('/', [
  body('title').notEmpty().withMessage('Title is required'),
  body('chatDate').isISO8601().withMessage('Chat date must be valid ISO date'),
  body('sourceId').optional().isString().withMessage('Source ID must be a string'),
  body('categoryId').optional().isString().withMessage('Category ID must be a string'),
  body('subcategoryId').optional().isString().withMessage('Subcategory ID must be a string'),
  body('projectId').optional().isString().withMessage('Project ID must be a string'),
  body('phaseId').optional().isString().withMessage('Phase ID must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const {
    title,
    chatDate,
    sourceId,
    categoryId,
    subcategoryId,
    projectId,
    phaseId,
    description,
    notes,
  } = req.body;

  const chat = await prisma.chat.create({
    data: {
      userId: req.user!.id,
      title,
      chatDate: new Date(chatDate),
      sourceId: sourceId || null,
      categoryId: categoryId || null,
      subcategoryId: subcategoryId || null,
      projectId: projectId || null,
      phaseId: phaseId || null,
      description: description || null,
      notes: notes || null,
    },
    include: {
      source: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      subcategory: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      phase: { select: { id: true, name: true } },
      format: { select: { id: true, name: true } },
    },
  });

  res.status(201).json(chat);
}));

// Upload chat file
router.post('/upload', upload.single('file'), requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  if (!req.file) {
    throw createError('No file uploaded', 400);
  }

  const {
    title,
    chatDate,
    sourceId,
    categoryId,
    subcategoryId,
    projectId,
    phaseId,
    description,
    notes,
  } = req.body;

  // Read file content
  const filePath = req.file.path;
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  // Get format ID
  const format = await prisma.fileFormat.findFirst({
    where: { 
      name: fileExtension,
      userId: req.user!.id
    }
  });

  if (!format) {
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    throw createError(`File format ${fileExtension} not supported`, 400);
  }

  // Create HTML version if it's a markdown file
  let htmlFile = null;
  if (fileExtension === '.md') {
    const { marked } = await import('marked');
    const htmlContent = await marked(fileContent);
    const htmlPath = filePath.replace('.md', '.html');
    fs.writeFileSync(htmlPath, htmlContent);
    htmlFile = path.basename(htmlPath);
  } else if (fileExtension === '.html') {
    htmlFile = req.file.filename;
  }

  const chat = await prisma.chat.create({
    data: {
      userId: req.user!.id,
      title: title || req.file.originalname,
      chatDate: chatDate ? new Date(chatDate) : new Date(),
      sourceId: sourceId || null,
      categoryId: categoryId || null,
      subcategoryId: subcategoryId || null,
      projectId: projectId || null,
      phaseId: phaseId || null,
      description: description || null,
      notes: notes || null,
      content: fileContent,
      originalFile: req.file.filename,
      htmlFile: htmlFile,
      formatId: format.id,
    },
    include: {
      source: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      subcategory: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      phase: { select: { id: true, name: true } },
      format: { select: { id: true, name: true } },
    },
  });

  res.status(201).json(chat);
}));

// Update chat
router.put('/:id', [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('chatDate').optional().isISO8601().withMessage('Chat date must be valid ISO date'),
  body('sourceId').optional().isString().withMessage('Source ID must be a string'),
  body('categoryId').optional().isString().withMessage('Category ID must be a string'),
  body('subcategoryId').optional().isString().withMessage('Subcategory ID must be a string'),
  body('projectId').optional().isString().withMessage('Project ID must be a string'),
  body('phaseId').optional().isString().withMessage('Phase ID must be a string'),
  body('description').optional().isString().withMessage('Description must be a string'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
], requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw createError('Validation failed', 400);
  }

  const { id } = req.params;
  const updateData = req.body;

  // Check if chat exists and belongs to user
  const existingChat = await prisma.chat.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
  });

  if (!existingChat) {
    throw createError('Chat not found', 404);
  }

  // Convert date if provided
  if (updateData.chatDate) {
    updateData.chatDate = new Date(updateData.chatDate);
  }

  const chat = await prisma.chat.update({
    where: { id },
    data: updateData,
    include: {
      source: { select: { id: true, name: true } },
      category: { select: { id: true, name: true } },
      subcategory: { select: { id: true, name: true } },
      project: { select: { id: true, name: true } },
      phase: { select: { id: true, name: true } },
      format: { select: { id: true, name: true } },
    },
  });

  res.json(chat);
}));

// Delete chat
router.delete('/:id', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;

  // Check if chat exists and belongs to user
  const chat = await prisma.chat.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
  });

  if (!chat) {
    throw createError('Chat not found', 404);
  }

  // Delete associated files
  if (chat.originalFile) {
    const originalPath = path.join(__dirname, '../../uploads', chat.originalFile);
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }
  }

  if (chat.htmlFile) {
    const htmlPath = path.join(__dirname, '../../uploads', chat.htmlFile);
    if (fs.existsSync(htmlPath)) {
      fs.unlinkSync(htmlPath);
    }
  }

  await prisma.chat.delete({
    where: { id }
  });

  res.json({ message: 'Chat deleted successfully' });
}));



// Export selected chats as ZIP
router.post('/export-selected', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { chatIds, format = 'all' } = req.body;

  if (!chatIds || !Array.isArray(chatIds) || chatIds.length === 0) {
    throw createError('No chat IDs provided', 400);
  }

  // Validate format parameter
  if (!['all', 'original', 'html'].includes(format)) {
    throw createError('Invalid format specified', 400);
  }

  // Get selected chats for the user
  const chats = await prisma.chat.findMany({
    where: { 
      id: { in: chatIds },
      userId: req.user!.id 
    },
    include: {
      source: { select: { name: true } },
      category: { select: { name: true } },
      format: { select: { name: true } },
    },
  });

  if (chats.length === 0) {
    throw createError('No chats found to export', 404);
  }

  // Create a temporary directory for the ZIP
  const tempDir = path.join(__dirname, '../../temp');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const zipPath = path.join(tempDir, `chatvault-selected-export-${Date.now()}.zip`);
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', { zlib: { level: 9 } });

  output.on('close', () => {
    res.download(zipPath, `chatvault-selected-export-${new Date().toISOString().split('T')[0]}.zip`, (err) => {
      // Clean up the temporary file
      if (fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
      }
    });
  });

  archive.on('error', (err) => {
    throw createError('Failed to create export archive', 500);
  });

  archive.pipe(output);

  // Add each selected chat file to the ZIP
  let filesAdded = 0;
  for (const chat of chats) {
    let filePath: string;
    let fileName: string;

    // Add original file based on format selection
    if (chat.originalFile && (format === 'all' || format === 'original')) {
      filePath = path.join(__dirname, '../../uploads', chat.originalFile);
      if (fs.existsSync(filePath)) {
        fileName = `${chat.title}${path.extname(chat.originalFile)}`;
        archive.file(filePath, { name: fileName });
        filesAdded++;
        console.log(`Added original file: ${fileName}`);
      } else {
        console.log(`Original file not found: ${filePath}`);
      }
    }

    // Add HTML file based on format selection
    if (chat.htmlFile && (format === 'all' || format === 'html')) {
      filePath = path.join(__dirname, '../../uploads', chat.htmlFile);
      if (fs.existsSync(filePath)) {
        fileName = `${chat.title}.html`;
        archive.file(filePath, { name: fileName });
        filesAdded++;
        console.log(`Added HTML file: ${fileName}`);
      } else {
        console.log(`HTML file not found: ${filePath}`);
      }
    }

    // Add metadata as JSON (always add this)
    const metadata = {
      id: chat.id,
      title: chat.title,
      description: chat.description,
      notes: chat.notes,
      chatDate: chat.chatDate,
      source: chat.source?.name,
      category: chat.category?.name,
      format: chat.format?.name,
      createdAt: chat.createdAt,
      updatedAt: chat.updatedAt,
    };

    archive.append(JSON.stringify(metadata, null, 2), { name: `${chat.title}-metadata.json` });
    console.log(`Added metadata for: ${chat.title}`);
  }

  console.log(`Total files added to archive: ${filesAdded}`);

  archive.finalize();
}));

// Export individual chat
router.get('/:id/export', requireUser, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { id } = req.params;
  const { format = 'original' } = req.query;

  const chat = await prisma.chat.findFirst({
    where: { 
      id,
      userId: req.user!.id
    }
  });

  if (!chat) {
    throw createError('Chat not found', 404);
  }

  let filePath: string;
  let fileName: string;

  if (format === 'html' && chat.htmlFile) {
    filePath = path.join(__dirname, '../../uploads', chat.htmlFile);
    fileName = `${chat.title}.html`;
  } else if (chat.originalFile) {
    filePath = path.join(__dirname, '../../uploads', chat.originalFile);
    fileName = `${chat.title}${path.extname(chat.originalFile)}`;
  } else {
    throw createError('No file available for export', 404);
  }

  if (!fs.existsSync(filePath)) {
    throw createError('File not found', 404);
  }

  res.download(filePath, fileName);
}));

export default router; 