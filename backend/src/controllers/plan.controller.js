import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Plan } from "../models/plan.model.js";

const getPlans = asyncHandler(async (req, res) => {
  const plans = await Plan.findAll({
    where: { is_active: true }
  });

  res
    .status(200)
    .json(new ApiResponse(200, plans, 'Plans fetched successfully'));

});


export { getPlans };