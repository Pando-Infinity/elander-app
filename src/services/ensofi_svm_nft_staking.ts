/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/ensofi_svm_nft_staking.json`.
 */
export type EnsofiSvmNftStaking = {
  address: "acmARoNLQpMT1fimKcMH8PdgCtw8LF4T8trmcz4cSw4";
  metadata: {
    name: "ensofiSvmNftStaking";
    version: "0.1.0";
    spec: "0.1.0";
    description: "Created with Anchor";
  };
  instructions: [
    {
      name: "closeStaking";
      discriminator: [61, 183, 134, 159, 84, 41, 222, 193];
      accounts: [
        {
          name: "operator";
          writable: true;
          signer: true;
        },
        {
          name: "stakingState";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  115,
                  116,
                  97,
                  107,
                  101
                ];
              },
              {
                kind: "account";
                path: "staking_state.collection";
                account: "stakingState";
              }
            ];
          };
        }
      ];
      args: [];
    },
    {
      name: "initStaking";
      discriminator: [42, 18, 242, 224, 66, 32, 122, 8];
      accounts: [
        {
          name: "operator";
          writable: true;
          signer: true;
        },
        {
          name: "stakingState";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  115,
                  116,
                  97,
                  107,
                  101
                ];
              },
              {
                kind: "account";
                path: "collection";
              }
            ];
          };
        },
        {
          name: "collection";
        },
        {
          name: "stakingAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              },
              {
                kind: "account";
                path: "collection";
              }
            ];
          };
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "stake";
      discriminator: [206, 176, 202, 18, 200, 209, 179, 108];
      accounts: [
        {
          name: "owner";
          writable: true;
          signer: true;
        },
        {
          name: "stakingState";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  115,
                  116,
                  97,
                  107,
                  101
                ];
              },
              {
                kind: "account";
                path: "collection";
              }
            ];
          };
        },
        {
          name: "stakingAuthority";
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              },
              {
                kind: "account";
                path: "collection";
              }
            ];
          };
        },
        {
          name: "stakeRecord";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ];
              },
              {
                kind: "account";
                path: "stakingState";
              },
              {
                kind: "account";
                path: "asset";
              },
              {
                kind: "account";
                path: "owner";
              }
            ];
          };
        },
        {
          name: "collection";
          writable: true;
        },
        {
          name: "asset";
          writable: true;
        },
        {
          name: "logWrapper";
          docs: ["The SPL Noop program."];
          optional: true;
        },
        {
          name: "mplCore";
          docs: ["The MPL Core program."];
          address: "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    },
    {
      name: "unStake";
      discriminator: [179, 121, 60, 247, 131, 199, 114, 26];
      accounts: [
        {
          name: "staker";
          writable: true;
          signer: true;
          relations: ["stakeRecord"];
        },
        {
          name: "stakingState";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  115,
                  116,
                  97,
                  107,
                  101
                ];
              },
              {
                kind: "account";
                path: "staking_state.collection";
                account: "stakingState";
              }
            ];
          };
        },
        {
          name: "stakingAuthority";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  116,
                  97,
                  107,
                  105,
                  110,
                  103,
                  95,
                  97,
                  117,
                  116,
                  104,
                  111,
                  114,
                  105,
                  116,
                  121
                ];
              },
              {
                kind: "account";
                path: "staking_state.collection";
                account: "stakingState";
              }
            ];
          };
        },
        {
          name: "stakeRecord";
          writable: true;
          pda: {
            seeds: [
              {
                kind: "const";
                value: [
                  115,
                  116,
                  97,
                  107,
                  101,
                  95,
                  114,
                  101,
                  99,
                  111,
                  114,
                  100
                ];
              },
              {
                kind: "account";
                path: "stakingState";
              },
              {
                kind: "account";
                path: "asset";
              },
              {
                kind: "account";
                path: "staker";
              }
            ];
          };
        },
        {
          name: "collection";
          writable: true;
        },
        {
          name: "asset";
          writable: true;
        },
        {
          name: "logWrapper";
          docs: ["The SPL Noop program."];
          optional: true;
        },
        {
          name: "mplCore";
          docs: ["The MPL Core program."];
          address: "CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d";
        },
        {
          name: "systemProgram";
          address: "11111111111111111111111111111111";
        }
      ];
      args: [];
    }
  ];
  accounts: [
    {
      name: "stakeRecord";
      discriminator: [174, 163, 11, 208, 150, 236, 11, 205];
    },
    {
      name: "stakingAuthority";
      discriminator: [56, 196, 139, 104, 150, 210, 147, 177];
    },
    {
      name: "stakingState";
      discriminator: [152, 226, 234, 201, 202, 8, 155, 60];
    }
  ];
  events: [
    {
      name: "closeStakingEvent";
      discriminator: [60, 5, 239, 251, 131, 222, 32, 67];
    },
    {
      name: "initStakingEvent";
      discriminator: [25, 244, 150, 17, 120, 236, 96, 116];
    },
    {
      name: "stakeEvent";
      discriminator: [226, 134, 188, 173, 19, 33, 75, 175];
    },
    {
      name: "unStakeEvent";
      discriminator: [161, 186, 194, 195, 6, 232, 138, 51];
    }
  ];
  errors: [
    {
      code: 6000;
      name: "invalidOperator";
      msg: "Invalid Operator";
    },
    {
      code: 6001;
      name: "tokenNotNft";
      msg: "Token is not NFT";
    },
    {
      code: 6002;
      name: "tokenAccountEmpty";
      msg: "Token account is empty";
    },
    {
      code: 6003;
      name: "collectionNotVerified";
      msg: "Collection is not verified";
    },
    {
      code: 6004;
      name: "invalidCollection";
      msg: "Invalid Collection";
    },
    {
      code: 6005;
      name: "stakingInactive";
      msg: "Staking is not active";
    },
    {
      code: 6006;
      name: "unsupportedTokenExtension";
      msg: "Invalid Staking Authority";
    },
    {
      code: 6007;
      name: "invalidGroupMemberPointerAuthority";
      msg: "Invalid Group Member Pointer Authority";
    },
    {
      code: 6008;
      name: "invalidGroupPointerAuthority";
      msg: "Invalid Group Pointer Authority";
    },
    {
      code: 6009;
      name: "nftNotBelongToCollection";
      msg: "NFT does not belong to collection";
    },
    {
      code: 6010;
      name: "invalidAccountOwner";
      msg: "Invalid account owner";
    }
  ];
  types: [
    {
      name: "closeStakingEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stakingState";
            type: "pubkey";
          },
          {
            name: "collection";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "initStakingEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "stakingState";
            type: "pubkey";
          },
          {
            name: "collection";
            type: "pubkey";
          }
        ];
      };
    },
    {
      name: "stakeEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "staker";
            type: "pubkey";
          },
          {
            name: "nftMint";
            type: "pubkey";
          },
          {
            name: "collection";
            type: "pubkey";
          },
          {
            name: "stakingState";
            type: "pubkey";
          },
          {
            name: "stakedAt";
            type: "i64";
          }
        ];
      };
    },
    {
      name: "stakeRecord";
      type: {
        kind: "struct";
        fields: [
          {
            name: "staker";
            type: "pubkey";
          },
          {
            name: "nftMint";
            type: "pubkey";
          },
          {
            name: "collection";
            type: "pubkey";
          },
          {
            name: "stakedAt";
            type: "i64";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "stakingAuthority";
      type: {
        kind: "struct";
        fields: [
          {
            name: "collection";
            type: "pubkey";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "stakingState";
      type: {
        kind: "struct";
        fields: [
          {
            name: "isActive";
            type: "bool";
          },
          {
            name: "collection";
            type: "pubkey";
          },
          {
            name: "totalStaked";
            type: "u64";
          },
          {
            name: "authority";
            type: "pubkey";
          },
          {
            name: "bump";
            type: "u8";
          }
        ];
      };
    },
    {
      name: "unStakeEvent";
      type: {
        kind: "struct";
        fields: [
          {
            name: "staker";
            type: "pubkey";
          },
          {
            name: "nftMint";
            type: "pubkey";
          },
          {
            name: "collection";
            type: "pubkey";
          },
          {
            name: "stakingState";
            type: "pubkey";
          }
        ];
      };
    }
  ];
};
