import { mockEthers } from '../../../test/mock-utils';
const templatesMock = jest.fn();
const getTemplatesMock = jest.fn();
mockEthers({ airnodeRrpMocks: { templates: templatesMock, getTemplates: getTemplatesMock } });

import { ethers } from 'ethers';
import * as templates from './template-fetching';
import * as fixtures from '../../../test/fixtures';
import { AirnodeRrpV0 } from '../contracts';

describe('fetch (templates)', () => {
  let mutableFetchOptions: templates.FetchOptions;

  beforeEach(() => {
    mutableFetchOptions = {
      airnodeRrpAddress: '0xD5659F26A72A8D718d1955C42B3AE418edB001e0',
      provider: new ethers.providers.JsonRpcProvider(),
      configTemplates: [],
      airnodeAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    };
  });

  it('uses valid templates from config without fetching from the chain', async () => {
    mutableFetchOptions = {
      ...mutableFetchOptions,
      configTemplates: [
        {
          templateId: '0x38ba0e80224f14d0c654c4ba6e3745fcb7f310fd4f2f80994fe802da013edafe',
          endpointId: '0x13dea3311fe0d6b84f4daeab831befbc49e19e6494c41e9e065a09c3c68f43b6',
          encodedParameters: '0x6874656d706c6174656576616c7565',
        },
      ],
    };

    const rawTemplates = {
      airnodes: ['airnode-0', '0xD5659F26A72A8D718d1955C42B3AE418edB001e0'],
      endpointIds: ['endpointId-0', '0x13dea3311fe0d6b84f4daeab831befbc49e19e6494c41e9e065a09c3c68f43b6'],
      parameters: ['0x6874656d706c6174656576616c7565', '0x6874656d706c6174656576616c7565'],
    };
    getTemplatesMock.mockResolvedValueOnce(rawTemplates);

    const apiCall1 = fixtures.requests.buildApiCall({
      templateId: '0x38ba0e80224f14d0c654c4ba6e3745fcb7f310fd4f2f80994fe802da013edafe',
    });
    const apiCall2 = fixtures.requests.buildApiCall({ templateId: 'templateId-0' });

    const [logs, res] = await templates.fetch([apiCall1, apiCall2], mutableFetchOptions);
    expect(logs).toEqual([]);
    expect(res).toEqual({
      'templateId-0': {
        airnodeAddress: 'airnode-0',
        endpointId: 'endpointId-0',
        encodedParameters: '0x6874656d706c6174656576616c7565',
        id: 'templateId-0',
      },
      '0x38ba0e80224f14d0c654c4ba6e3745fcb7f310fd4f2f80994fe802da013edafe': {
        airnodeAddress: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
        endpointId: '0x13dea3311fe0d6b84f4daeab831befbc49e19e6494c41e9e065a09c3c68f43b6',
        encodedParameters: '0x6874656d706c6174656576616c7565',
        id: '0x38ba0e80224f14d0c654c4ba6e3745fcb7f310fd4f2f80994fe802da013edafe',
      },
    });

    expect(templatesMock).not.toHaveBeenCalled();
    // Not called with a valid config templateId
    expect(getTemplatesMock).not.toHaveBeenCalledWith([
      '0x38ba0e80224f14d0c654c4ba6e3745fcb7f310fd4f2f80994fe802da013edafe',
    ]);
    // Called with a templateId not found in the config
    expect(getTemplatesMock).toHaveBeenCalledWith(['templateId-0']);
  });

  it('fetches templates in groups of 10', async () => {
    const firstRawTemplates = {
      airnodes: Array.from(Array(10).keys()).map((n) => `airnode-${n}`),
      endpointIds: Array.from(Array(10).keys()).map((n) => `endpointId-${n}`),
      parameters: Array.from(Array(10).keys()).map(() => '0x6874656d706c6174656576616c7565'),
    };

    const secondRawTemplates = {
      airnodes: Array.from(Array(9).keys()).map((n) => `airnode-${n + 10}`),
      endpointIds: Array.from(Array(9).keys()).map((n) => `endpointId-${n + 10}`),
      parameters: Array.from(Array(9).keys()).map(() => '0x6874656d706c6174656576616c7565'),
    };

    getTemplatesMock.mockResolvedValueOnce(firstRawTemplates);
    getTemplatesMock.mockResolvedValueOnce(secondRawTemplates);

    const apiCalls = Array.from(Array(19).keys()).map((n) => {
      return fixtures.requests.buildApiCall({
        id: `${n}`,
        templateId: `templateId-${n}`,
      });
    });

    const [logs, res] = await templates.fetch(apiCalls, mutableFetchOptions);
    expect(logs).toEqual([]);
    expect(Object.keys(res).length).toEqual(19);
    expect(res['templateId-0']['endpointId']).toEqual('endpointId-0');
    expect(res['templateId-18']['endpointId']).toEqual('endpointId-18');

    expect(getTemplatesMock).toHaveBeenCalledTimes(2);
    expect(getTemplatesMock.mock.calls).toEqual([
      [Array.from(Array(10).keys()).map((n) => `templateId-${n}`)],
      [Array.from(Array(9).keys()).map((n) => `templateId-${n + 10}`)],
    ]);
  });

  it('returns all template attributes', async () => {
    const rawTemplates = {
      airnodes: ['airnode-0'],
      endpointIds: ['endpointId-0'],
      parameters: ['0x6874656d706c6174656576616c7565'],
    };
    getTemplatesMock.mockResolvedValueOnce(rawTemplates);

    const apiCall = fixtures.requests.buildApiCall({ templateId: 'templateId-0' });
    const [logs, res] = await templates.fetch([apiCall], mutableFetchOptions);
    expect(logs).toEqual([]);
    expect(res).toEqual({
      'templateId-0': {
        airnodeAddress: 'airnode-0',
        endpointId: 'endpointId-0',
        encodedParameters: '0x6874656d706c6174656576616c7565',
        id: 'templateId-0',
      },
    });
  });

  it('filters out duplicate template IDs', async () => {
    const rawTemplates = {
      airnodes: ['airnode-0'],
      endpointIds: ['endpointId-0'],
      parameters: ['0x6874656d706c6174656576616c7565'],
    };
    getTemplatesMock.mockResolvedValueOnce(rawTemplates);

    const apiCall = fixtures.requests.buildApiCall({ templateId: 'templateId-0' });
    const apiCallDup = fixtures.requests.buildApiCall({ templateId: 'templateId-0' });
    const [logs, res] = await templates.fetch([apiCall, apiCallDup], mutableFetchOptions);
    expect(logs).toEqual([]);
    expect(res).toEqual({
      'templateId-0': {
        airnodeAddress: 'airnode-0',
        endpointId: 'endpointId-0',
        encodedParameters: '0x6874656d706c6174656576616c7565',
        id: 'templateId-0',
      },
    });

    expect(getTemplatesMock).toHaveBeenCalledTimes(1);
    expect(getTemplatesMock.mock.calls).toEqual([[['templateId-0']]]);
  });

  it('ignores API calls without a template ID', async () => {
    const apiCall = fixtures.requests.buildApiCall({ templateId: null });
    const [logs, res] = await templates.fetch([apiCall], mutableFetchOptions);
    expect(logs).toEqual([]);
    expect(res).toEqual({});
    expect(getTemplatesMock).not.toHaveBeenCalled();
  });

  it('retries once on failure', async () => {
    const rawTemplates = {
      airnodes: ['airnode-0'],
      endpointIds: ['endpointId-0'],
      parameters: ['0x6874656d706c6174656576616c7565'],
    };
    getTemplatesMock.mockRejectedValueOnce(new Error('Server says no'));
    getTemplatesMock.mockResolvedValueOnce(rawTemplates);

    const apiCall = fixtures.requests.buildApiCall({ templateId: 'templateId-0' });
    const [logs, res] = await templates.fetch([apiCall], mutableFetchOptions);
    expect(logs).toEqual([]);
    expect(res).toEqual({
      'templateId-0': {
        airnodeAddress: 'airnode-0',
        endpointId: 'endpointId-0',
        encodedParameters: '0x6874656d706c6174656576616c7565',
        id: 'templateId-0',
      },
    });
    expect(getTemplatesMock).toHaveBeenCalledTimes(2);
  });

  it('fetches templates individually if the template group cannot be fetched', async () => {
    getTemplatesMock.mockRejectedValueOnce(new Error('Server says no'));
    getTemplatesMock.mockRejectedValueOnce(new Error('Server says no'));

    const rawTemplate = {
      airnode: 'airnode-0',
      endpointId: 'endpointId-0',
      parameters: '0x6874656d706c6174656576616c7565',
    };
    templatesMock.mockResolvedValueOnce(rawTemplate);

    const apiCall = fixtures.requests.buildApiCall({ templateId: 'templateId-0' });
    const [logs, res] = await templates.fetch([apiCall], mutableFetchOptions);
    expect(logs).toEqual([
      { level: 'ERROR', message: 'Failed to fetch API call templates', error: new Error('Server says no') },
      { level: 'INFO', message: `Fetched API call template:${apiCall.templateId}` },
    ]);
    expect(res).toEqual({
      'templateId-0': {
        airnodeAddress: 'airnode-0',
        endpointId: 'endpointId-0',
        encodedParameters: '0x6874656d706c6174656576616c7565',
        id: 'templateId-0',
      },
    });
    expect(getTemplatesMock).toHaveBeenCalledTimes(2);
    expect(templatesMock).toHaveBeenCalledTimes(1);
  });

  it('retries individual template calls once', async () => {
    getTemplatesMock.mockRejectedValueOnce(new Error('Server says no'));
    getTemplatesMock.mockRejectedValueOnce(new Error('Server says no'));

    const rawTemplate = {
      airnode: 'airnode-0',
      endpointId: 'endpointId-0',
      parameters: '0x6874656d706c6174656576616c7565',
    };
    templatesMock.mockRejectedValueOnce(new Error('Server says no'));
    templatesMock.mockResolvedValueOnce(rawTemplate);

    const apiCall = fixtures.requests.buildApiCall({ templateId: 'templateId-0' });
    const [logs, res] = await templates.fetch([apiCall], mutableFetchOptions);
    expect(logs).toEqual([
      { level: 'ERROR', message: 'Failed to fetch API call templates', error: new Error('Server says no') },
      { level: 'INFO', message: `Fetched API call template:${apiCall.templateId}` },
    ]);
    expect(res).toEqual({
      'templateId-0': {
        airnodeAddress: 'airnode-0',
        endpointId: 'endpointId-0',
        encodedParameters: '0x6874656d706c6174656576616c7565',
        id: 'templateId-0',
      },
    });
    expect(getTemplatesMock).toHaveBeenCalledTimes(2);
    expect(templatesMock).toHaveBeenCalledTimes(2);
  });

  it('returns nothing after all template calls are exhausted', async () => {
    getTemplatesMock.mockRejectedValueOnce(new Error('Server says no'));
    getTemplatesMock.mockRejectedValueOnce(new Error('Server says no'));

    templatesMock.mockRejectedValueOnce(new Error('Still no'));
    templatesMock.mockRejectedValueOnce(new Error('Still no'));

    const apiCall = fixtures.requests.buildApiCall({ templateId: 'templateId-0' });
    const [logs, res] = await templates.fetch([apiCall], mutableFetchOptions);
    expect(logs).toEqual([
      { level: 'ERROR', message: 'Failed to fetch API call templates', error: new Error('Server says no') },
      {
        level: 'ERROR',
        message: `Failed to fetch API call template:${apiCall.templateId}`,
        error: new Error('Still no'),
      },
    ]);
    expect(res).toEqual({});
    expect(getTemplatesMock).toHaveBeenCalledTimes(2);
    expect(templatesMock).toHaveBeenCalledTimes(2);
  });
});

describe('fetchTemplate', () => {
  let mutableAirnodeRrp: AirnodeRrpV0;

  beforeEach(() => {
    mutableAirnodeRrp = new ethers.Contract('address', ['ABI']) as unknown as AirnodeRrpV0;
  });

  it('fetches the individual template', async () => {
    const rawTemplate = {
      airnode: 'airnode-0',
      endpointId: 'endpointId-0',
      parameters: '0x6874656d706c6174656576616c7565',
    };
    templatesMock.mockResolvedValueOnce(rawTemplate);

    const templateId = 'templateId';
    const [logs, res] = await templates.fetchTemplate(mutableAirnodeRrp, templateId);
    expect(logs).toEqual([{ level: 'INFO', message: `Fetched API call template:${templateId}` }]);
    expect(res).toEqual({
      airnodeAddress: 'airnode-0',
      endpointId: 'endpointId-0',
      encodedParameters: '0x6874656d706c6174656576616c7565',
      id: templateId,
    });
    expect(templatesMock).toHaveBeenCalledTimes(1);
  });

  it('retries individual template calls once', async () => {
    const rawTemplate = {
      airnode: 'airnode-0',
      endpointId: 'endpointId-0',
      parameters: '0x6874656d706c6174656576616c7565',
    };
    templatesMock.mockRejectedValueOnce(new Error('Server says no'));
    templatesMock.mockResolvedValueOnce(rawTemplate);

    const templateId = 'templateId';
    const [logs, res] = await templates.fetchTemplate(mutableAirnodeRrp, templateId);
    expect(logs).toEqual([{ level: 'INFO', message: `Fetched API call template:${templateId}` }]);
    expect(res).toEqual({
      airnodeAddress: 'airnode-0',
      endpointId: 'endpointId-0',
      encodedParameters: '0x6874656d706c6174656576616c7565',
      id: templateId,
    });
    expect(templatesMock).toHaveBeenCalledTimes(2);
  });

  it('returns nothing after all individual template calls are exhausted', async () => {
    templatesMock.mockRejectedValueOnce(new Error('Server says no'));
    templatesMock.mockRejectedValueOnce(new Error('Server says no'));

    const templateId = 'templateId';
    const [logs, res] = await templates.fetchTemplate(mutableAirnodeRrp, templateId);
    expect(logs).toEqual([
      {
        level: 'ERROR',
        message: `Failed to fetch API call template:${templateId}`,
        error: new Error('Server says no'),
      },
    ]);
    expect(res).toEqual(null);
    expect(templatesMock).toHaveBeenCalledTimes(2);
  });
});
