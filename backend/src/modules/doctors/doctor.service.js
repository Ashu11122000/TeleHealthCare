import { findDoctors } from "./doctor.model.js";

export const searchDoctors = async (filters) => {
  const doctors = await findDoctors(filters);

  return doctors
    .map(d => ({
      ...d,
      rank_score:
        d.experience_years * 2 +
        (d.is_verified ? 20 : 0) +
        (d.available_slots > 0 ? 10 : 0)
    }))
    .sort((a, b) => b.rank_score - a.rank_score);
};
