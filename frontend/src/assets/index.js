import onboardingFarm from './onboarding-farm.png';
import leavesTopRight from './leaves-top-right.png';
import leavesBottomRight from './leaves-bottom-right.png';
import profileLeaves from './profile-leaves.png';
import settingsLeaves from './settings-leaves.png';
import wheat from './wheat.png';
import rice from './rice.png';
import farmerAvatar from './farmer-avatar.png';

const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';
const dataUri = (b64) => `data:image/png;base64,${b64}`;

export const illustrations = {
  onboarding: onboardingFarm,
  leavesTopRight: leavesTopRight,
  leavesBottomRight: leavesBottomRight,
  profileLeaves: profileLeaves,
  settingsLeaves: settingsLeaves,
};

export const crops = {
  wheat: wheat,
  rice: rice,
  default: wheat,
};

export const avatars = {
  farmer: farmerAvatar,
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
