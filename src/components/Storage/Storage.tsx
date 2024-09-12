import {DataContent, Item, Section, SyntaxHighlight} from "../TopBar";
import {FolderIcon} from "@heroicons/react/24/solid";
import * as React from "react";
import {useNetworkForAddress} from "../../hooks/use-network";
import * as fcl from "@onflow/fcl";
import useSWR from "swr";
import {cadenceValueToDict, checkNodes, executeScript, executeScriptRaw, numberWithCommas} from "../../lib/utils";
import getStoragePaths from "./StoragePaths.cdc";
import getStorage from "./GetStorage.cdc";
import {useParams, NavLink} from "react-router-dom"
import YAML from "json-to-pretty-yaml"
import {useState} from "react";
import {withPrefix} from "@onflow/fcl";

export function StorageView() {
    var {address, path} = useParams()
    address = withPrefix(address)

    useNetworkForAddress(address)
    const {data, error, isLoading} =
        useSWR(["raw", address, path], () =>
            executeScriptRaw({
                query: getStorage,
                args:[
                    fcl.arg(address, fcl.t.Address),
                    fcl.arg(path, fcl.t.String),
                ]
            }).then((v) => {
                return YAML.stringify(cadenceValueToDict(v.encodedData, false), null,2 );
            }).catch((e)=>{
                console.log(e)
            }))



    return <DataContent
        loading={isLoading} error={error}
        title="Raw Storage Data"
        subtitle = {`/storage/${path}`}>

        <SyntaxHighlight address={address} data = {data}/>

    </DataContent>



}

export default function Storage() {
    var {address, domain, path} = useParams()
    address = withPrefix(address)

    const [isShown, setShown] = useState(domain == "ft")

    useNetworkForAddress(address)
    const {data, error, isLoading} =
        useSWR(`storagePaths_${address}`, () =>
            executeScript({
                query: getStoragePaths,
                args:[
                    fcl.arg(address, fcl.t.Address),
                ]
            }))


    let paths = data ? data.paths.sort((a, b) => {
        return a.identifier > b.identifier
    }) : null


    let percent = data ? parseInt(data.used)/parseInt(data.capacity) * 100: null

    return <Section
            title="Storage"
            Icon={FolderIcon}
            canExpand={data &&  paths && paths.length>0}
            expanded={isShown} setExpanded={setShown}
            subtitle={data &&  `${paths && paths.length} Items - ${numberWithCommas(percent)}% used`}
            loading={isLoading}
            error={error}>

        {
            paths && paths.map((xpath) =>
            <Item
                selected={domain=="storage" && xpath.identifier == path}
                key={`storage_${xpath.identifier}`}>
                <NavLink to={`/${address}/storage/${xpath.identifier}`}>
                    <p> {xpath.identifier} </p>
                </NavLink>

            </Item>)
        }
        </Section>




}