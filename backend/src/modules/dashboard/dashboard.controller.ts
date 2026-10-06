import { monthRangeFromQuery } from '../../shared/utils/finance';
import { asyncHandler } from '../../shared/utils/async-handler';
import { dashboardService } from './dashboard.service';

export const dashboardController = {
  summary: asyncHandler(async (req, res) => {
    const range = monthRangeFromQuery(req.query.month);
    const summary = await dashboardService.getSummary(req.user?.userId ?? '', range);
    res.json(summary);
  }),
};
