const prisma = require('../config/database');
const bcrypt = require('bcryptjs');

const getUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', role } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {
      ...(search && { OR: [{ name: { contains: search } }, { email: { contains: search } }] }),
      ...(role && { role })
    };
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where, skip, take: parseInt(limit),
        select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, isActive: true, lastLogin: true, createdAt: true },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count({ where })
    ]);
    res.json({ users, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (error) { next(error); }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      select: { id: true, name: true, email: true, phone: true, avatar: true, role: true, isActive: true, emergencyContact: true, createdAt: true, lastLogin: true,
        _count: { select: { reports: true, comments: true, emergencyAlerts: true } }
      }
    });
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json(user);
  } catch (error) { next(error); }
};

const createUser = async (req, res, next) => {
  try {
    const { name, email, password, phone, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, phone, role: role || 'USER' },
      select: { id: true, name: true, email: true, role: true, createdAt: true }
    });
    res.status(201).json(user);
  } catch (error) { next(error); }
};

const updateUser = async (req, res, next) => {
  try {
    const { name, email, phone, role, isActive } = req.body;
    const data = {};
    if (name) data.name = name;
    if (email) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (role) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;
    const user = await prisma.user.update({
      where: { id: req.params.id }, data,
      select: { id: true, name: true, email: true, phone: true, role: true, isActive: true }
    });
    res.json(user);
  } catch (error) { next(error); }
};

const deleteUser = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } });
    res.json({ message: 'User deleted successfully.' });
  } catch (error) { next(error); }
};

module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
