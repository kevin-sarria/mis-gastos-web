import { monthRangeFromQuery } from '../../shared/utils/finance';
import { asyncHandler } from '../../shared/utils/async-handler';
import { insightsService } from './insights.service';

export const insightsController = {
  get: asyncHandler(async (req, res) => {
    const range = monthRangeFromQuery(req.query.month);
    const data = await insightsService.getForUser(req.user?.userId ?? '', range);
    res.json(data);
  }),
};
