import { asyncHandler } from '../../shared/utils/async-handler';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  summary: asyncHandler(async (req, res) => {
    const summary = await dashboardService.getSummary(req.user?.userId ?? '');
    res.json(summary);
  }),
};
