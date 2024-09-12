import {Address, AllContent, CommandBar, Content, SideBar, TopBar} from "../components/TopBar.tsx";
import FindProfile from "../components/FindProfile/FindProfile.tsx";
import * as React from "react";
import {useParams} from "react-router-dom"
import FTVaults, {FTVaultView} from "../components/FTVaults/FTVaults.tsx";
import NFTCollections, {NFTCollectionView} from "../components/NFTCollections/NFTCollections.tsx";
import Capabilities, {CapabilitiesView} from "../components/Capabilities/Capabilities.tsx";
import Storage, {StorageView} from "../components/Storage/Storage.tsx";
import Contracts, {ContractView} from "../components/Contracts/Contracts.tsx";
import {withPrefix} from "@onflow/fcl";
export default function Account() {
    var  {address, domain} = useParams()
    address = withPrefix(address)
    const[sideBarVisible, setSideBarVisible] = React.useState(true)

    const pathMap = {
        "ft": <FTVaultView/>,
        "nft": <NFTCollectionView/>,
        "storage": <StorageView/>,
        "cap": <CapabilitiesView />,
        "contract": <ContractView/>
    }

    const content = pathMap[domain] ?? null
//                    <FindProfile/>
    return (
        <>
        <CommandBar/>

    <div className="dark:bg-gray-990 flex flex-col text-gray-950 dark:text-white">
            <TopBar setSideBarVisible={setSideBarVisible} sideBarVisible={sideBarVisible}/>
            <AllContent>
                {sideBarVisible && <SideBar>
                    <Address address={address}/>
                    <FindProfile/>
                    <Contracts/>

                    <FTVaults/>
                    <NFTCollections/>
                    <Capabilities/>
                    <Storage/>
                </SideBar>}

                <div className="flex flex-grow flex-auto overflow-y-scroll">
                    <Content>
                        {content}
                    </Content>
                </div>
            </AllContent>

        </div>
        </>
    )
}