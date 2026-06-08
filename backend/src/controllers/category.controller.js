const prisma = require('../config/database');

const getCategories = async (req, res, next) => {
  try {
    const categories = await prisma.reportCategory.findMany({
      where: { isActive: true },
      include: { _count: { select: { reports: true } } },
      orderBy: { name: 'asc' }
    });
    res.json(categories);
  } catch (error) { next(error); }
};

const createCategory = async (req, res, next) => {
  try {
    const { name, icon, color, description } = req.body;
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const category = await prisma.reportCategory.create({ data: { name, slug, icon, color, description } });
    res.status(201).json(category);
  } catch (error) { next(error); }
};

const updateCategory = async (req, res, next) => {
  try {
    const { name, icon, color, description, isActive } = req.body;
    const data = {};
    if (name) { data.name = name; data.slug = name.toLowerCase().replace(/\s+/g, '-'); }
    if (icon) data.icon = icon;
    if (color) data.color = color;
    if (description !== undefined) data.description = description;
    if (isActive !== undefined) data.isActive = isActive;
    const category = await prisma.reportCategory.update({ where: { id: req.params.id }, data });
    res.json(category);
  } catch (error) { next(error); }
};

const deleteCategory = async (req, res, next) => {
  try {
    await prisma.reportCategory.delete({ where: { id: req.params.id } });
    res.json({ message: 'Category deleted.' });
  } catch (error) { next(error); }
};

module.exports = { getCategories, createCategory, updateCategory, deleteCategory };
