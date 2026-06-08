const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
const dataUri = (b64) => `data:image/png;base64,${b64}`;

export const illustrations = {
  onboarding: require('./onboarding-farm.png'),
  leavesTopRight: require('./leaves-top-right.png'),
  leavesBottomRight: require('./leaves-bottom-right.png'),
  profileLeaves: require('./profile-leaves.png'),
  settingsLeaves: require('./settings-leaves.png'),
  emptyAlerts: require('./empty-alerts.png'),
  healthyBanner: require('./healthy-farm-banner.png'),
};

export const crops = {
  wheat: require('./wheat.png'),
  rice: require('./rice.png'),
  corn: require('./corn.png'),
  sugarcane: require('./sugarcane.png'),
  default: require('./wheat.png'),
};

export const avatars = {
  farmer: require('./farmer-avatar.png'),
};

export const branding = {
  logo: { uri: dataUri(tinyPngBase64) },
  mark: { uri: dataUri(tinyPngBase64) },
};

export default {
  illustrations,
  crops,
  avatars,
  branding,
};
