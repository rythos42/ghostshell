import axios from 'axios';

export const BungieCodes = {
  Success: 1,
  ItemNotFound: 1623,
  CharacterNotInTower: 1634,
  NoRoomInDestination: 1642,
  CannotPerformActionAtThisLocation: 1671
};

export default class {
  constructor(args) {
    if (typeof args === 'string') this.apiKey = args;
    else {
      this.accessToken = args.accessToken;
      this.apiKey = args.apiKey;
      this.destinyMembershipId = args.destinyMembershipId;
    }
  }

  setAccessToken(accessToken) {
    this.accessToken = accessToken;
  }

  setDestinyMembershipId(destinyMembershipId) {
    this.destinyMembershipId = destinyMembershipId;
  }

  async getOAuthToken({ code, clientId }) {
    const data = `grant_type=authorization_code&code=${code}&client_id=${clientId}`;
    const response = await axios.post(
      'https://www.bungie.net/platform/app/oauth/token/',
      data,
      this.getAxiosConfig()
    );

    return {
      accessToken: response.data.access_token,
      destinyMembershipId: response.data.membership_id,
      apiKey: this.apiKey
    };
  }

  createEquipItem({ characterId, membershipType }) {
    return ({ itemInstanceId }) => this.equipItem({ itemInstanceId, characterId, membershipType });
  }

  async equipItem({ itemInstanceId, characterId, membershipType }) {
    const data = { itemId: itemInstanceId, characterId, membershipType };
    const response = await axios.post(
      'https://www.bungie.net/platform/Destiny2/Actions/Items/EquipItem/',
      data,
      this.getAxiosConfig()
    );

    return response.data;
  }

  createTransferItem({ characterId, membershipType }) {
    return ({ shell: { itemInstanceId, itemHash }, toVault }) =>
      this.transferItem({
        itemInstanceId,
        itemHash,
        toVault,
        characterId,
        membershipType
      });
  }

  async transferItem({ itemInstanceId, itemHash, characterId, membershipType, toVault }) {
    const data = {
      characterId: characterId,
      membershipType: membershipType,
      itemId: itemInstanceId,
      itemReferenceHash: itemHash,
      stackSize: 1,
      transferToVault: toVault
    };
    const response = await axios.post(
      'https://www.bungie.net/platform/Destiny2/Actions/Items/TransferItem/',
      data,
      this.getAxiosConfig()
    );

    return response.data;
  }

  async getMembershipInfo() {
    const response = await this.get(`/User/GetMembershipsById/${this.destinyMembershipId}/254/`);

    return response.data.Response;
  }

  async getProfileData({ membershipId, membershipType }) {
    const components =
      'CharacterInventories,CharacterEquipment,ProfileInventories,Characters,ItemSockets';
    const response = await this.get(
      `/Destiny2/${membershipType}/Profile/${membershipId}/?components=${components}`
    );

    return response.data.Response;
  }

  getAxiosConfig() {
    const config = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-Key': this.apiKey
      }
    };
    if (this.accessToken) config.headers.Authorization = `Bearer ${this.accessToken}`;

    return config;
  }

  async get(path) {
    const platformUrl = 'https://www.bungie.net/Platform';
    return axios.get(`${platformUrl}/${path}`, this.getAxiosConfig());
  }
}
