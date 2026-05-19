import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { Lead } from '../models/Lead';
import { sendSuccess, sendError, buildPaginationMeta } from '../utils/response';
import { LeadFilters, LeadStatus, LeadSource } from '../types';
import { config } from '../config';

export const getLeads = async (req: Request, res: Response): Promise<void> => {
  const {
    status,
    source,
    search,
    sort = 'latest',
    page = 1,
    limit = config.pagination.defaultLimit,
  } = req.query as unknown as LeadFilters;

  const parsedPage = Math.max(1, Number(page));
  const parsedLimit = Math.min(
    Number(limit) || config.pagination.defaultLimit,
    config.pagination.maxLimit
  );
  const skip = (parsedPage - 1) * parsedLimit;

  // Build query
  const query: mongoose.FilterQuery<typeof Lead> = {};

  // Role-based filtering — sales users see only their leads
  if (req.user?.role === 'sales') {
    query.createdBy = new mongoose.Types.ObjectId(req.user.id);
  }

  if (status) query.status = status as LeadStatus;
  if (source) query.source = source as LeadSource;

  if (search) {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [{ name: searchRegex }, { email: searchRegex }];
  }

  const sortOrder = sort === 'oldest' ? 1 : -1;

  const [leads, total] = await Promise.all([
    Lead.find(query)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .sort({ createdAt: sortOrder })
      .skip(skip)
      .limit(parsedLimit)
      .lean(),
    Lead.countDocuments(query),
  ]);

  const meta = buildPaginationMeta(total, parsedPage, parsedLimit);

  sendSuccess(res, leads, 'Leads retrieved successfully', 200, meta);
};

export const getLeadById = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query: mongoose.FilterQuery<typeof Lead> = { _id: id };
  if (req.user?.role === 'sales') {
    query.createdBy = new mongoose.Types.ObjectId(req.user.id);
  }

  const lead = await Lead.findOne(query)
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!lead) {
    sendError(res, 'Lead not found', 404);
    return;
  }

  sendSuccess(res, lead, 'Lead retrieved successfully');
};

export const createLead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const leadData = {
    ...req.body,
    createdBy: new mongoose.Types.ObjectId(req.user!.id),
  };

  const lead = await Lead.create(leadData);
  const populated = await lead.populate([
    { path: 'assignedTo', select: 'name email' },
    { path: 'createdBy', select: 'name email' },
  ]);

  sendSuccess(res, populated, 'Lead created successfully', 201);
};

export const updateLead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  const query: mongoose.FilterQuery<typeof Lead> = { _id: id };
  if (req.user?.role === 'sales') {
    query.createdBy = new mongoose.Types.ObjectId(req.user.id);
  }

  const lead = await Lead.findOneAndUpdate(query, req.body, {
    new: true,
    runValidators: true,
  })
    .populate('assignedTo', 'name email')
    .populate('createdBy', 'name email');

  if (!lead) {
    sendError(res, 'Lead not found or unauthorized', 404);
    return;
  }

  sendSuccess(res, lead, 'Lead updated successfully');
};

export const deleteLead = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { id } = req.params;

  // Only admins can delete any lead; sales users can only delete their own
  const query: mongoose.FilterQuery<typeof Lead> = { _id: id };
  if (req.user?.role === 'sales') {
    query.createdBy = new mongoose.Types.ObjectId(req.user.id);
  }

  const lead = await Lead.findOneAndDelete(query);
  if (!lead) {
    sendError(res, 'Lead not found or unauthorized', 404);
    return;
  }

  sendSuccess(res, null, 'Lead deleted successfully');
};

export const exportLeadsCSV = async (
  req: Request,
  res: Response
): Promise<void> => {
  const query: mongoose.FilterQuery<typeof Lead> = {};

  if (req.user?.role === 'sales') {
    query.createdBy = new mongoose.Types.ObjectId(req.user.id);
  }

  const leads = await Lead.find(query)
    .populate('createdBy', 'name email')
    .lean();

  const headers = [
    'Name',
    'Email',
    'Status',
    'Source',
    'Notes',
    'Created By',
    'Created At',
  ];

  const rows = leads.map((lead: typeof leads[number]) => {
    const createdBy = lead.createdBy as unknown as { name: string; email: string } | null;
    return [
      `"${lead.name}"`,
      `"${lead.email}"`,
      `"${lead.status}"`,
      `"${lead.source}"`,
      `"${(lead.notes ?? '').replace(/"/g, '""')}"`,
      `"${createdBy?.name ?? ''}"`,
      `"${new Date(lead.createdAt).toISOString()}"`,
    ].join(',');
  });

  const csv = [headers.join(','), ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="leads-export-${Date.now()}.csv"`
  );
  res.send(csv);
};

export const getLeadStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  const matchStage: mongoose.PipelineStage.Match = { $match: {} };
  if (req.user?.role === 'sales') {
    matchStage.$match.createdBy = new mongoose.Types.ObjectId(req.user.id);
  }

  const stats = await Lead.aggregate([
    matchStage,
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        new: { $sum: { $cond: [{ $eq: ['$status', 'New'] }, 1, 0] } },
        contacted: { $sum: { $cond: [{ $eq: ['$status', 'Contacted'] }, 1, 0] } },
        qualified: { $sum: { $cond: [{ $eq: ['$status', 'Qualified'] }, 1, 0] } },
        lost: { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        total: 1,
        byStatus: {
          New: '$new',
          Contacted: '$contacted',
          Qualified: '$qualified',
          Lost: '$lost',
        },
      },
    },
  ]);

  const sourceStats = await Lead.aggregate([
    matchStage,
    { $group: { _id: '$source', count: { $sum: 1 } } },
  ]);

  sendSuccess(
    res,
    {
      overview: stats[0] ?? { total: 0, byStatus: { New: 0, Contacted: 0, Qualified: 0, Lost: 0 } },
      bySource: sourceStats,
    },
    'Stats retrieved'
  );
};
