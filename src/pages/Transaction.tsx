import {Address, AllContent, CommandBar, Content, SideBar, SyntaxHighlight, TopBar} from "../components/TopBar.tsx";
import * as React from "react";
import {useParams} from "react-router-dom"
import {clsx} from "clsx";
import {Editor, useMonaco} from "@monaco-editor/react";
import {useEffect, useState} from "react";
import configureCadence from "../lib/cadence.ts";
import {useTx} from "../hooks/use-tx.hook.ts";
import {getNetworkConfig} from "../lib/config.ts";
import * as fcl from "@onflow/fcl"
import { extractTransactionArguments } from "@onflow/flow-cadut"
import dedent from "dedent";
import {cadenceValueToDict, fmtTransactionStatus, getNetworkFromAddress} from "../lib/utils.tsx";
import YAML from "json-to-pretty-yaml"
import ago from "s-ago"
import dateFormat from "dateformat";

const Tag = ({...props}) => {
    return <div className={clsx("pl-2 pr-2 w-fit text-sm p-1 rounded-full border-2 border-${props.color}-600",props.className)}>
        {props.children} {props.color}
    </div>
}

export default function  Transaction() {
    const {txId} = useParams()
    const monaco  = useMonaco();
    const tx = useTx(txId)

    const [txStatus, setTxStatus] = useState(null)
    const [txBlock, setTxBlock] = useState(null)
    const [txInfo, setTxInfo] = useState(null)

    const [value, setValue] = React.useState('2')
    const [network, setNetwork] = React.useState('mainnet')
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

    console.log(window.matchMedia('(prefers-color-scheme: dark)'))
    useEffect(() => {

        async function getTxStatus(txId){
            fcl.config(getNetworkConfig(network))
            try{
                await fcl.send([fcl.getTransaction(txId)]).then(fcl.decode).then(setTxInfo)
            }
            catch{
                if (network==="testnet"){
                    setNetwork("previewnet")
                }
                if (network==="mainnet"){
                    setNetwork("testnet")
                }

            }
        }
        getTxStatus(txId)


    }, [txId, network])

    useEffect(() => {
        if (txInfo)
            fcl.tx(txId).subscribe(setTxStatus)
    }, [txId, txInfo])

    useEffect(() => {
        if (txStatus==null) return
        async function getTimestamp(txStatus){
            const latestBlockHeader = await fcl
                .send([fcl.getBlockHeader(), fcl.atBlockId(txStatus.blockId)])
                .then(fcl.decode);
            setTxBlock(latestBlockHeader)
        }
        getTimestamp(txStatus)

        if (txStatus && txStatus.errorMessage!==""){
            setValue('1')
        }
        else{
            setValue('2')
        }
    }, [txStatus])


    const [selectedTab, setSelectedTab] = React.useState("script")
    useEffect(() => {
        if (!monaco) return
        configureCadence(monaco)
    }, [monaco]);
    if (!monaco) return null;
    function setEditorReadOnly(readOnly) {
        return (editor, monaco)=>{
            editor.updateOptions({ readOnly: readOnly })
            editor.updateOptions({ scrollBeyondLastLine: false });
        }

    }

    if (txStatus == null || txInfo == null || txStatus.status==='') {
        return (
            <>
            <CommandBar/>
        <TopBar setSideBarVisible={null} sideBarVisible={false}/>

        <div className="flex-grow  p-6 rounded-lg  mx-auto">
            <h5><span>Fetching info for: </span>{txId}</h5>
        </div>
        </>
            )
    }

    var argLabels = null
    if (txInfo?.script){
        argLabels = extractTransactionArguments(txInfo?.script)
    }

    var code=dedent(txInfo.script)
    var height = (code.split('\n').length+3)*18

    return (
        <>

                <CommandBar/>
                <TopBar setSideBarVisible={null} sideBarVisible={false}/>

                <div className="flex-grow  p-6 rounded-lg  mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-2">
                            <h2 className="text-xl font-semibold">Transaction</h2>

                            <span
                                className=" bg-green-800 min-h-4 text-white px-3 py-1 rounded-full text-xs">{network.toUpperCase()}</span>

                            <span
                                className={clsx("p-1 bg-green-800 min-h-4 text-white px-3 py-1  rounded-full text-xs", txStatus.errorMessage == "" ? "" : "!bg-red-600")}>{txStatus.errorMessage === "" ? "SUCCESS" : "ERROR"}</span>

                            <span
                                className="bg-gray-800 min-h-4 text-white px-3 py-1  rounded-full text-xs">{fmtTransactionStatus(txStatus.status)}</span>

                        </div>

                    </div>

                    <div className="mb-4">
                        <p className=" text-sm mb-1">{txId}</p>
            </div>

            <div className="flex flex-row flex-wrap gap-4 mb-6">
                <div>
                    <p className="opacity-70 font-bold text-sm mb-1">Proposer</p>
                    <p className="text-sm">{txInfo.proposalKey?.address}</p>
                </div>
                <div>
                    <p className="opacity-70 font-bold text-sm mb-1">Payer</p>
                    <p className="text-sm">{txInfo.payer}</p>
                </div>
                <div>
                    <p className="opacity-70 font-bold text-sm mb-1">Authorizers</p>
                    {txInfo?.authorizers?.map((auth, i) => (
                        <p className="text-sm">{auth}</p>
                    ))}

                </div>
            </div>
                    {txBlock && <div className="flex flex-col mb-6 space-y-1 text-sm">
                <p className="opacity-70 font-bold">Block</p>
                <p className="opacity-70"> {txBlock.height}</p>
                <p className="opacity-70"> {txBlock.id}</p>
                <p className="opacity-70">{ago(new Date(txBlock.timestamp))} - {dateFormat(new Date(txBlock.timestamp))}</p>
            </div>}

                    {txStatus.errorMessage && txStatus.errorMessage!="" &&
                        <div className={"bg-red-200 p-3 text-sm mb-4"}>
                         {txStatus.errorMessage}
                    </div>
                    }

            <div className="border-t border-gray-700 pt-4">
                <div className="flex items-center space-x-4 text-sm text-blue-400">
                    <button className="flex items-center" onClick={()=>setSelectedTab("script")}>
                        <span>Script</span>
                    </button>
                    <button onClick={()=>setSelectedTab("arguments")}>Arguments ({argLabels.length})</button>
                    <button onClick={()=>setSelectedTab("events")}>Events ({txStatus.events.length})</button>
                </div>
                <div className="mt-4  p-0">


                    { selectedTab=="script" && <Editor
                    language={"cadence"}
                    theme={darkMode?"vs-dark":"vs-light"}
                    onChange={null}
                    value={code}
                    onMount={()=>setEditorReadOnly(true)}
                    className={"text-xs  overflow-x-auto"}
                    options={{
                        readOnly: true,
                        fontSize: 12,
                        selectionHighlight: false,
                        padding: {
                            top: 16,
                            bottom: 16,
                        },
                        scrollBeyondLastLine: false,
                        minimap: { enabled: false },
                        scrollbar:{
                            alwaysConsumeMouseWheel: false,
                        },
                    }}
                    height={height}
                >
                    </Editor>}


                    {selectedTab=="arguments" && <div className={"flex flex-col space-y-2"}>
                        {txInfo?.args.map((arg:any,i:any) =>
                            <div className="flex flex-col" key={`arg_${i}`}>
                                <div>
                                    {argLabels[i].split(":")[0]} &nbsp;

                                    <span
                                        className="bg-green-800 text-green-300 px-2 py-0.5 rounded-full text-xs">
                                        {argLabels[i].split(":").slice(1).join(":")}
                                    </span>
                                    <SyntaxHighlight  address={null} data={YAML.stringify(cadenceValueToDict(arg, false))}/>


                                    {}
                                </div>
                            </div>)}
                    </div>
                    }

                    {selectedTab=="events" &&<div className={"flex flex-col space-y-2"}>
                        {txStatus.events.map((event:any,i:any) =>
                            <div className="flex flex-col" key={`arg_${i}`}>
                                <div>

                                    <span
                                        className="bg-green-800 text-green-300 px-2 py-0.5 rounded-full text-xs">
                                        {event.type}
                                    </span>
                                    <SyntaxHighlight  address={null} data={YAML.stringify(event)}/>


                                    {}
                                </div>
                            </div>)}
                    </div>
                    }



                </div>
            </div>
        </div>
        </>
    );
};

