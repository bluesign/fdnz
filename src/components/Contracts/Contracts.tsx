import * as React from "react";
import {NavLink, useParams} from "react-router-dom"
import {DocumentIcon, MagnifyingGlassIcon, PencilSquareIcon} from "@heroicons/react/24/solid";
import {DataContent, Item, Section} from "../TopBar.tsx";
import {useContext, useEffect, useState} from "react";
import {useAccount} from "../../hooks/use-account"
import {useCurrentUser} from "../../hooks/use-current-user"

import {Editor, useMonaco} from "@monaco-editor/react";
import configureCadence from "../../lib/cadence";
import {SearchContext} from "../SearchContext.ts";
import {sansPrefix, withPrefix} from "@onflow/fcl";
import {Button} from "@headlessui/react";
import {IDLE, useTx} from "../../hooks/use-tx.hook.ts";
import {extractContractName} from "@onflow/flow-cadut"

import * as fcl from "@onflow/fcl"
function setEditorReadOnly(readOnly) {
    return (editor, monaco)=>{
        editor.updateOptions({ readOnly: readOnly })
        editor.updateOptions({ scrollBeyondLastLine: false });


        // link handling
        if (location.hash.substring(0,2)=="#L") {
            var lines =location.hash.substring(2).split("-")
            var startLine = parseInt(lines[0])
            var endLine = startLine
            if (lines.length==2){
                endLine = parseInt(lines[1])
            }
            var line = parseInt(location.hash.substring(2))
            if (line > 0) {

                editor.createDecorationsCollection([
                    {
                        range: new monaco.Range(startLine, 1, endLine, 1000),
                        options: {inlineClassName: "lineLinkHighlight"},
                    },
                ]);

               /* const element = document.querySelector("div[data-mode-id='cadence']")
                const rect = element.getBoundingClientRect() // get rects(width, height, top, etc)
                const viewHeight = window.innerHeight;
                element.scroll({
                    top: rect.top + line * 21 - viewHeight / 2,
                    behavior: 'smooth' // smooth scroll
                });*/

                editor.revealLine(line-10)
            }
        }

        editor.addAction({
            // An unique identifier of the contributed action.
            id: "copy-link",

            // A label of the action that will be presented to the user.
            label: "Copy link",

            // An optional array of keybindings for the action.
            keybindings: [
                monaco.KeyMod.CtrlCmd | monaco.KeyCode.F10,
                // chord
                monaco.KeyMod.chord(
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK,
                    monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyM
                ),
            ],

            // A precondition for this action.
            precondition: null,

            // A rule to evaluate on top of the precondition in order to dispatch the keybindings.
            keybindingContext: null,

            contextMenuGroupId: "navigation",

            contextMenuOrder: 1.5,

            run: function (ed) {
                var sel = ed.getSelection()
                location.hash = '#L' + sel.startLineNumber
                if (sel.startLineNumber!=sel.endLineNumber){
                    location.hash = location.hash + "-" + sel.endLineNumber
                }
                navigator.clipboard.writeText(location.toString());
                window.location.reload()
            },
        });

    }
}

export function ContractView() {
    var {address, domain, path} = useParams()
    address = withPrefix(address)

    const account = useAccount(address)
    const user = useCurrentUser()
    const IS_CURRENT_USER = withPrefix(user.addr) === withPrefix(address)
    const monaco  = useMonaco();

    const [exec, status, txStatus, details] = useTx(
        [
            fcl.transaction`
      transaction(name: String, code: String) {
        prepare(acct: auth(Contracts) &Account) {
          if acct.contracts.get(name: name)==nil{
              acct.contracts.add(name: name, code: code.decodeHex())
            }else{
              acct.contracts.update(name: name, code: code.decodeHex())
            }
          }
      }
    `,
            fcl.payer(fcl.authz),
            fcl.proposer(fcl.authz),
            fcl.authorizations([fcl.authz]),
            fcl.limit(1000),
        ],
        {
            async onSuccess() {
                window.location.reload()
            },
        }
    )
    const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches

    var monacoTheme =darkMode ? "vs-dark":"vs-light"
    useEffect(() => {
        if (!monaco) return
        configureCadence(monaco)
        //disable search
        /*monaco.editor.addKeybindingRule({
            keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF,
            command: null
        });*/
    }, [monaco]);
    if (!monaco) return null;

    const goBrowser = ()=>{
        window.open("https://contractbrowser.com/A."+sansPrefix(address)+"."+path)
    }


    const saveContract = () => {
        // prettier-ignore
        exec([
            fcl.arg(extractContractName(code), t.String),
            fcl.arg(Buffer.from(code, "utf8").toString("hex"), t.String)
        ])
    }

    let code = account && account.contracts && account.contracts[path]
    if (!code) return <></>
//height={(code && code.split('\n').length+3)*18}
    return <DataContent
        loading={account==null || account.contracts==null}
        error={false}>
        <Editor
            language={"cadence"}
            theme={monacoTheme}
            onChange={null}
            onMount={setEditorReadOnly(!IS_CURRENT_USER)}
            value={code}
            className={"overflow-hidden "}
            options={{
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

        >

        </Editor>
        {!IS_CURRENT_USER &&
            <Button className={"flex h-16 w-16 rounded-full bg-blue-500 items-center p-4 fixed right-14 bottom-10  z-40 flex-grow"} onClick={goBrowser}>
            <MagnifyingGlassIcon className={"flex w-8"} />
            </Button>
            }

        {IS_CURRENT_USER &&
            <Button className={"flex h-16 w-16 rounded-full bg-blue-500 items-center p-4 fixed right-14 bottom-10  z-40 flex-grow"} onClick={saveContract}>
                <PencilSquareIcon className={"flex w-8"} />
            </Button>
        }

        {status !== IDLE &&
        <Button className={"flex h-16 w-96 rounded-full bg-blue-500 items-center p-4 fixed left-14 bottom-10  z-40 flex-grow"}>
            <Roll label={txStatus} /> {details.txId}
        </Button>
        }


    </DataContent>
}
const defaultRoll = [
    "[*     ]",
    "[ *    ]",
    "[  *   ]",
    "[   *  ]",
    "[    * ]",
    "[     *]",
    "[    * ]",
    "[   *  ]",
    "[  *   ]",
    "[ *    ]",
    "[*     ]",
]
export const Roll = ({seq = defaultRoll, label}) => {
    const [i, set] = useState(0)
    useEffect(() => {
        const interval = setInterval(() => {
            set(state => {
                var next = state + 1
                return next >= seq.length ? 0 : next
            })
        }, seq.length * 15)
        return () => clearInterval(interval)
    })
    return (
        <pre>
            {seq[i]}
            {label && " " + label}
        </pre>
    )
}

export default function Contracts() {


    const {address,domain, path} = useParams()
    const account = useAccount(address)
    const user = useCurrentUser()
    const IS_CURRENT_USER = user && withPrefix(user.addr) === withPrefix(address)
    const [isShown, setShown] = useState(domain=="contract")

    var numberOfContracts = account && account.contracts?Object.keys(account.contracts).length: 0
    const searchContext = useContext(SearchContext)

    if (account && account.contracts && Object.keys(account.contracts).length>0) {
        searchContext["Contract"] = {
            heading: "Contracts",
            id: "contract",
            items: [],
        }

        Object.keys(account.contracts).map((contract) => {
            const item = {
                id: contract,
                children: contract,
                icon: "DocumentIcon",
                href: `/${address}/contract/${contract}`,
            }
            searchContext["Contract"].items.push(item)
        })
    }

    return <Section Icon={DocumentIcon}
                    expanded={isShown}
                    setExpanded={numberOfContracts>0?setShown:null}
                    canExpand={numberOfContracts>0}
                    title="Contracts"
                    subtitle={`${numberOfContracts} deployed contract(s)`}
                    loading={account==null || account.contracts==null}
                    error={false}
    >

        {account && account.contracts && Object.keys(account.contracts).map((contract)=>
            <Item selected={domain=="contract" && path==contract} key={contract}>
                <NavLink to={`/${address}/contract/${contract}`}>
                    <p> {contract} </p>
                </NavLink>
            </Item>
        )}

        {account && account.contracts  && IS_CURRENT_USER && <Item>
            <NavLink to={`/${address}/contract/_create`}>
                <p> Create New Contract </p>
            </NavLink>
        </Item>}

    </Section>


}