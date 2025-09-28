const profileService = require('../services/profile.service');

exports.getProfile = async (req, res) => {
  try {
    const profile = await profileService.getProfile(req.cookies.empid, req.cookies.context.companyid);
    res.json(profile);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPhoto = async (req, res) => {
  try {
    const photo = await profileService.getPhoto(req.cookies.empid, req.cookies.context.companyid);
    if (photo) {
      // Allow cross-origin resource usage from the mobile demo (different port)
      res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
      res.contentType('image/jpeg').send(photo);
    } else {
      res.status(404).json({ error: "Photo not found" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getProfileSummary = async (req, res) => {
  try {
    const summary = await profileService.getProfileSummary(req.cookies.empid, req.cookies.context.companyid);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getCalendar = async (req, res) => {
  try {
    const calendar = await profileService.getCalendar(req.cookies.empid, req.cookies.context.companyid);
    res.json(calendar);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// List companies an employee belongs to
exports.getEmployeeCompanies = async (req, res) => {
  try {
    const empid = req.cookies.empid;
    const companies = await profileService.getEmployeeCompanies(empid);
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
