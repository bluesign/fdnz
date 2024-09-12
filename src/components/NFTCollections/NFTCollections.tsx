import {DataContent, Item, Section} from "../../components/TopBar";
import {PhotoIcon} from "@heroicons/react/24/solid";
import * as React from "react";
import {useNetworkForAddress} from "../../hooks/use-network";
import useSWR from "swr";
import {cadenceValueToDict, executeScript, executeScriptRaw} from "../../lib/utils";
import queryNFTCollections from "./NFTCollections.cdc";
import browseNFTCollection from "./BrowseCollection.cdc";
import YAML from "json-to-pretty-yaml"

import * as fcl from "@onflow/fcl";
import {useParams, NavLink} from "react-router-dom"
import {Button} from "@headlessui/react";
import {useContext, useState} from "react";
import {clsx} from "clsx";
import {SearchContext} from "../SearchContext.ts";
import {NFTDisplay} from "../MetaData.tsx";
import {withPrefix} from "@onflow/fcl";
import {NFTMetaData, NFTMetaDataView} from "./NFTMetadata.tsx";




export function NFTCollectionView() {
    var {address, path, uuid} = useParams()
    address = withPrefix(address)
    uuid = uuid?parseInt(uuid):0

    useNetworkForAddress(address)
    const {data, error, isLoading} =
        useSWR(`nftCollectionData_${uuid}_${address}_${path}`, () =>
            executeScriptRaw({
                query: browseNFTCollection,
                args: [
                    fcl.arg(address, fcl.t.Address),
                    fcl.arg(path, fcl.t.String),
                    fcl.arg(uuid, fcl.t.UInt64)
                ]
            }).then((results) => {
                return cadenceValueToDict(results.encodedData, true)
            }))

    data && data.map && data.sort((a, b) => {
        return parseInt(a.id) > parseInt(b.id)
    })

    console.log(data)


    return <DataContent icon={<PhotoIcon className="mr-1 size-5 min-w-5"/>}
                        title=""
                        subtitle=""
                        loading={isLoading}
                        error={error}>

        <div className="flex flex-wrap mt-2">
            {uuid==0 && data && data.map && data.map((nft) =>  <NavLink to={`/${address}/nft/${path}/${nft.id}`}>{NFTDisplay(nft)}</NavLink>)}
            {uuid==0 && data && !data.map && NFTDisplay(data)}

            {uuid>0 && data && NFTMetaDataView(data)}
        </div>


    </DataContent>

}

export default function NFTCollections() {
    var {address, domain, path} = useParams()
    address = withPrefix(address)

    const [showEmptyCollections, setShowEmptyCollections] = useState(false)
    const [showRecoveredVaults, setShowRecoveredVaults] = useState(false)
    const [isShown, setShown] = useState(domain == "nft")
    const searchContext = useContext(SearchContext)

    useNetworkForAddress(address)
    const {data, error, isLoading} =
        useSWR(`nftCollections_${address}`, () =>
            executeScript({
                query: queryNFTCollections,
                args: [
                    fcl.arg(address, fcl.t.Address),
                ]
            })
        )
    var recovered = 0
    var empty = 0

    if (data){
        data.sort((a, b) => {
            if (!a.isRecovered && b.isRecovered ) return -1
            if (a.isRecovered && !b.isRecovered ) return 1

            return parseInt(a.count) < parseInt(b.count)
        })

        searchContext["NFT"] =   {
            heading: "NFT Collections",
            id: "nft",
            items: [],
        }

        data.map((collection) => {
            const item = {
                id: collection.type.typeID,
                children: collection.type.typeID,
                icon: "PhotoIcon",
                href: `/${address}/nft/${collection.path.identifier}`,
            }
            searchContext["NFT"].items.push(item)
        })

        recovered = data.filter((collection) => (collection.isRecovered)).length
        empty = data.filter((collection) => (parseInt(collection.count) == 0)).length
    }

    return <Section Icon={PhotoIcon}
                    title="NFT Collections"
                    subtitle={`${data && data.length} Collections`}
                    expanded={isShown} setExpanded={setShown}
                    loading={isLoading}
                    canExpand={data && data.length > 0}
                    error={error}>


        {data && data.filter((collection) => (showEmptyCollections || parseInt(collection.count) > 0))
            .filter((collection) => (showRecoveredVaults || !collection.isRecovered)).map((collection) =>
            <Item
                selected={domain=="nft" && collection.path.identifier == path}
                className={clsx("flex border-gray-200 dark:border-gray-800  flex-row block py-1 ps-4 -ms-px border-s-2 border-transparent  text-gray-700 hover:border-gray-400 hover:text-neutral-900 focus:outline-none focus:border-gray-400 focus:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300 dark:focus:text-neutral-300", collection.path.identifier == path ? "!text-blue-600 !border-blue-600 dark:!border-gray-100  dark:!text-gray-100" : "")}
                key={`nft_${collection.path.identifier}`}>
                <NavLink to={`/${address}/nft/${collection.path.identifier}`}>
                    <p>/storage/{collection.path.identifier} {collection.isRecovered?"(Legacy)":""}  </p>
                    <p className="text-xs opacity-70" >{collection.type.typeID}  </p>
                    <p className="text-xs opacity-70"> Count: {collection.count} </p>
                </NavLink>
            </Item>)
        }

        { data && recovered>0  && <Item className={"flex"} key={`nft_hide_show_action`}>
            <Button className="flex text-xs opacity-70" onClick={() => setShowRecoveredVaults(!showRecoveredVaults)}>
                <b>{showRecoveredVaults ? "Hide" : "Show"} {recovered} legacy collection{recovered>1?"s":""}</b>
            </Button>
        </Item>}

        { data && empty>0  && <Item className={"flex"} key={`nft_hide_show_action2`}>
            <Button className="flex text-xs opacity-70" onClick={() => setShowEmptyCollections(!showEmptyCollections)}>
                <b>{showEmptyCollections ? "Hide" : "Show"} {empty} empty collection{empty>1?"s":""}</b>
            </Button>
        </Item>}

    </Section>

}

