import { ClientRequest, RequestStatus, Withdrawal } from '../../../src/types';

export function createWithdrawal(params?: Partial<ClientRequest<Withdrawal>>): ClientRequest<Withdrawal> {
  // These fields have invalid values on purpose to allow for easier reading. When necessary,
  // they can be overridden with valid values
  return {
    designatedWallet: 'designatedWallet',
    destinationAddress: 'destinationAddress',
    id: 'withdrawalId',
    metadata: {
      blockNumber: 10716082,
      transactionHash: 'logTransactionHash',
    },
    providerId: 'providerId',
    requesterIndex: '1',
    status: RequestStatus.Pending,
    ...params,
  };
}