import Event from '../models/Event.model.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get all events (public)
// @route   GET /api/events
// @access  Public
export const getEvents = asyncHandler(async (req, res) => {
  const {
    category,
    city,
    search,
    minPrice,
    maxPrice,
    isOnline,
    isFeatured,
    page = 1,
    limit = 12,
    sort = 'date'
  } = req.query;

  // Build query
  const query = { status: 'published' };

  if (category) {
    query.category = category;
  }

  if (city) {
    if (city === 'Online') {
      query.isOnline = true;
    } else {
      query.city = city;
    }
  }

  if (isOnline === 'true') {
    query.isOnline = true;
  }

  if (isFeatured === 'true') {
    query.isFeatured = true;
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } },
      { organizer: { $regex: search, $options: 'i' } }
    ];
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  // Sort options
  let sortOption = {};
  switch (sort) {
    case 'date':
      sortOption = { date: 1 };
      break;
    case 'price-low':
      sortOption = { price: 1 };
      break;
    case 'price-high':
      sortOption = { price: -1 };
      break;
    case 'popularity':
      sortOption = { availableTickets: -1 };
      break;
    default:
      sortOption = { date: 1 };
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const events = await Event.find(query)
    .select('-createdBy')
    .sort(sortOption)
    .skip(skip)
    .limit(limitNum)
    .lean();

  const total = await Event.countDocuments(query);

  res.status(200).json({
    success: true,
    count: events.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    data: events
  });
});

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .select('-createdBy')
    .lean();

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  if (event.status !== 'published') {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  res.status(200).json({
    success: true,
    data: event
  });
});

// @desc    Create event (Admin only)
// @route   POST /api/events
// @access  Private/Admin
export const createEvent = asyncHandler(async (req, res) => {
  const eventData = {
    ...req.body,
    createdBy: req.user.id
  };

  // Calculate total and available tickets from tiers
  if (eventData.ticketTiers && eventData.ticketTiers.length > 0) {
    eventData.totalTickets = eventData.ticketTiers.reduce(
      (sum, tier) => sum + (tier.total || tier.available || 0),
      0
    );
    eventData.availableTickets = eventData.ticketTiers.reduce(
      (sum, tier) => sum + (tier.available || 0),
      0
    );
  }

  const event = await Event.create(eventData);

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    data: event
  });
});

// @desc    Update event (Admin only)
// @route   PUT /api/events/:id
// @access  Private/Admin
export const updateEvent = asyncHandler(async (req, res) => {
  let event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Update event
  event = await Event.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true
    }
  );

  // Recalculate ticket availability if tiers were updated
  if (req.body.ticketTiers && Array.isArray(req.body.ticketTiers)) {
    event.totalTickets = req.body.ticketTiers.reduce(
      (sum, tier) => sum + (tier.total || tier.available || 0),
      0
    );
    event.availableTickets = req.body.ticketTiers.reduce(
      (sum, tier) => sum + (tier.available || 0),
      0
    );
    await event.save();
  }

  res.status(200).json({
    success: true,
    message: 'Event updated successfully',
    data: event
  });
});

// @desc    Delete event (Admin only)
// @route   DELETE /api/events/:id
// @access  Private/Admin
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    return res.status(404).json({
      success: false,
      message: 'Event not found'
    });
  }

  // Soft delete - change status to cancelled
  event.status = 'cancelled';
  await event.save();

  res.status(200).json({
    success: true,
    message: 'Event deleted successfully'
  });
});

// @desc    Get events by admin
// @route   GET /api/events/admin/all
// @access  Private/Admin
export const getAdminEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({ createdBy: req.user.id })
    .sort({ createdAt: -1 })
    .lean();

  res.status(200).json({
    success: true,
    count: events.length,
    data: events
  });
});

