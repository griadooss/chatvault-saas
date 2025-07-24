import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting ChatVault database seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'admin@chatvault.com' },
    update: {},
    create: {
      email: 'admin@chatvault.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  console.log('✅ Created test user:', user.email);

  // Create default sources
  const sources = await Promise.all([
    prisma.source.upsert({
      where: { name_userId: { name: 'WhatsApp', userId: user.id } },
      update: {},
      create: {
        name: 'WhatsApp',
        description: 'WhatsApp chat exports',
        isActive: true,
        userId: user.id,
      },
    }),
    prisma.source.upsert({
      where: { name_userId: { name: 'Telegram', userId: user.id } },
      update: {},
      create: {
        name: 'Telegram',
        description: 'Telegram chat exports',
        isActive: true,
        userId: user.id,
      },
    }),
    prisma.source.upsert({
      where: { name_userId: { name: 'Discord', userId: user.id } },
      update: {},
      create: {
        name: 'Discord',
        description: 'Discord chat exports',
        isActive: true,
        userId: user.id,
      },
    }),
    prisma.source.upsert({
      where: { name_userId: { name: 'Slack', userId: user.id } },
      update: {},
      create: {
        name: 'Slack',
        description: 'Slack chat exports',
        isActive: true,
        userId: user.id,
      },
    }),
  ]);

  console.log('✅ Created sources:', sources.map(s => s.name));

  // Create default categories
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name_userId: { name: 'Work', userId: user.id } },
      update: {},
      create: {
        name: 'Work',
        description: 'Work-related conversations',
        isActive: true,
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { name_userId: { name: 'Personal', userId: user.id } },
      update: {},
      create: {
        name: 'Personal',
        description: 'Personal conversations',
        isActive: true,
        userId: user.id,
      },
    }),
    prisma.category.upsert({
      where: { name_userId: { name: 'Project', userId: user.id } },
      update: {},
      create: {
        name: 'Project',
        description: 'Project-related discussions',
        isActive: true,
        userId: user.id,
      },
    }),
  ]);

  console.log('✅ Created categories:', categories.map(c => c.name));

  // Create subcategories for Work
  const workCategory = categories.find(c => c.name === 'Work');
  if (workCategory) {
    const subcategories = await Promise.all([
      prisma.subcategory.upsert({
        where: { name_categoryId: { name: 'Meetings', categoryId: workCategory.id } },
        update: {},
        create: {
          name: 'Meetings',
          description: 'Meeting discussions',
          isActive: true,
          userId: user.id,
          categoryId: workCategory.id,
        },
      }),
      prisma.subcategory.upsert({
        where: { name_categoryId: { name: 'Planning', categoryId: workCategory.id } },
        update: {},
        create: {
          name: 'Planning',
          description: 'Planning discussions',
          isActive: true,
          userId: user.id,
          categoryId: workCategory.id,
        },
      }),
    ]);

    console.log('✅ Created subcategories:', subcategories.map(s => s.name));
  }

  // Create default projects
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { name_userId: { name: 'ChatVault Development', userId: user.id } },
      update: {},
      create: {
        name: 'ChatVault Development',
        description: 'Development of the ChatVault system',
        isActive: true,
        userId: user.id,
      },
    }),
    prisma.project.upsert({
      where: { name_userId: { name: 'Website Redesign', userId: user.id } },
      update: {},
      create: {
        name: 'Website Redesign',
        description: 'Website redesign project',
        isActive: true,
        userId: user.id,
      },
    }),
  ]);

  console.log('✅ Created projects:', projects.map(p => p.name));

  // Create phases for ChatVault Development
  const chatvaultProject = projects.find(p => p.name === 'ChatVault Development');
  if (chatvaultProject) {
    const phases = await Promise.all([
      prisma.phase.upsert({
        where: { name_projectId: { name: 'Planning', projectId: chatvaultProject.id } },
        update: {},
        create: {
          name: 'Planning',
          description: 'Initial planning phase',
          isActive: true,
          userId: user.id,
          projectId: chatvaultProject.id,
        },
      }),
      prisma.phase.upsert({
        where: { name_projectId: { name: 'Development', projectId: chatvaultProject.id } },
        update: {},
        create: {
          name: 'Development',
          description: 'Active development phase',
          isActive: true,
          userId: user.id,
          projectId: chatvaultProject.id,
        },
      }),
      prisma.phase.upsert({
        where: { name_projectId: { name: 'Testing', projectId: chatvaultProject.id } },
        update: {},
        create: {
          name: 'Testing',
          description: 'Testing and quality assurance',
          isActive: true,
          userId: user.id,
          projectId: chatvaultProject.id,
        },
      }),
    ]);

    console.log('✅ Created phases:', phases.map(p => p.name));
  }

  // Create default file formats
  const formats = await Promise.all([
    prisma.fileFormat.upsert({
      where: { name_userId: { name: '.md', userId: user.id } },
      update: {},
      create: {
        name: '.md',
        description: 'Markdown files',
        isActive: true,
        userId: user.id,
      },
    }),
    prisma.fileFormat.upsert({
      where: { name_userId: { name: '.txt', userId: user.id } },
      update: {},
      create: {
        name: '.txt',
        description: 'Text files',
        isActive: true,
        userId: user.id,
      },
    }),
    prisma.fileFormat.upsert({
      where: { name_userId: { name: '.html', userId: user.id } },
      update: {},
      create: {
        name: '.html',
        description: 'HTML files',
        isActive: true,
        userId: user.id,
      },
    }),
  ]);

  console.log('✅ Created file formats:', formats.map(f => f.name));

  // Create a sample chat
  const sampleChat = await prisma.chat.create({
    data: {
      userId: user.id,
      title: 'Sample Chat Export',
      description: 'This is a sample chat export for testing purposes',
      content: 'This is sample chat content for testing the system.',
      originalFile: 'sample_chat.md',
      htmlFile: 'sample_chat.html',
      notes: 'This is a test chat entry',
      chatDate: new Date(),
      sourceId: sources.find(s => s.name === 'WhatsApp')?.id,
      categoryId: categories.find(c => c.name === 'Work')?.id,
      formatId: formats.find(f => f.name === '.md')?.id,
    },
  });

  console.log('✅ Created sample chat:', sampleChat.title);

  console.log('🎉 ChatVault database seeded successfully!');
  console.log('📧 Login with: admin@chatvault.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 