export function getNetworkConfig(network){
    const networkConfig = {
        "testnet":{
            "accessNode.api": "https://rest-testnet.onflow.org",
            "discovery.wallet": "https://fcl-discovery.onflow.org/testnet/authn",
            "fcl.eventsPollRate": 2500,
            "discovery.wallet.method": "POP/RPC",
            "0xFIND": "0xa16ab1d0abde3625",
            "0xFDNZ": "0x3eaf2fbdb66c65a3",
            "0xFlowToken": "0x7e60df042a9c0868",
            "0xFungibleToken": "0x9a0766d93b6608b7",
            "0xFungibleTokenMetadataViews": "0x9a0766d93b6608b7",
            "0xMetadataViews": "0x631e88ae7f1d7c20",
            "0xNonFungibleToken": "0x631e88ae7f1d7c20",
            "ViewResolver": "0x631e88ae7f1d7c20",
        },
        "mainnet":{
            "accessNode.api": "https://rest-mainnet.onflow.org",
            "discovery.wallet": "https://fcl-discovery.onflow.org/authn",
            "fcl.eventsPollRate": 2500,
            "discovery.wallet.method": "POP/RPC",
            "0xFDNZ": "0x73e4a1094d0bcab6",
            "0xFIND": "0x097bafa4e0b48eef",
            "0xFlowToken": "0x1654653399040a61",
            "0xFungibleToken": "0xf233dcee88fe0abe",
            "0xFungibleTokenMetadataViews": "0xf233dcee88fe0abe",
            "0xMetadataViews": "0x1d7e57aa55817448",
            "0xNonFungibleToken": "0x1d7e57aa55817448",
            "ViewResolver": "0x1d7e57aa55817448",


        },

    }
    return networkConfig[network]
}
