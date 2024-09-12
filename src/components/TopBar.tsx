import * as React from "react"
import {checkNodes, cn, getNetworkFromAddress} from "../lib/utils"
import {
    Bars3Icon,
    MagnifyingGlassIcon,
    SunIcon,
    UserCircleIcon
} from "@heroicons/react/24/solid";
import {ChevronDownIcon, ChevronUpIcon}
    from "@heroicons/react/24/outline";

import {ExclamationCircleIcon} from "@heroicons/react/24/outline"
import {Button, Input} from "@headlessui/react";
import {clsx} from "clsx";
import "react-cmdk/dist/cmdk.css";
import CommandPalette, {filterItems, getItemIndex, useHandleOpenCommandPalette} from "react-cmdk";
import {useContext, useState} from "react";
import {SearchContext} from "./SearchContext.ts";
import SyntaxHighlighter, { createElement } from 'react-syntax-highlighter';
import YAML from "json-to-pretty-yaml"

import {a11yLight} from "react-syntax-highlighter/dist/esm/styles/hljs"
import { vs2015 } from 'react-syntax-highlighter/dist/esm/styles/hljs';


export function Address(props) {
    return <span className="flex pb-6 font-bold text-sm opacity-80">
        {props.address} - {getNetworkFromAddress(props.address)}
    </span>
}

function goSearch(query) {
    if (query.code === "Enter") {
        window.location = "/" + query.target.value
    }
}

/*
<UserCircleIcon className="size-6 text-white"/>
        <SunIcon className="size-6 text-white"/>
 */
export const TopBar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({setSideBarVisible=null, sideBarVisible=false,...props}, ref) => (
    <div
        className={cn("z-30 flex flex-row items-center p-3 space-x-5 bg-blue-600 dark:bg-gray-900  shadow-gray-300 dark:shadow-black shadow-md")}
        ref={ref}  {...props}>
        <Button onClick={() => setSideBarVisible(!sideBarVisible)}>
            <Bars3Icon className="size-6 text-white"/>
        </Button>
        <div className="flex grow items-center size-10 p-2 bg-lighten-200 hover:bg-lighten-300">
            <MagnifyingGlassIcon className="size-5 text-white"/>
            <Input className="grow pl-3 size-6 bg-transparent text-white border-0 focus:outline-none"
                   type="text" name="search"
                   placeholder="Transaction ID / Account Address / .find Address"
                   onKeyDown={(e) => goSearch(e)}
            >
            </Input>
        </div>

    </div>
))

export const AllContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({...props}, ref) => (
    <div className="max-h-lvh flex flex-row pt-0 z-10"  {...props} ref={ref}>

        {props.children}

    </div>
))

export const Loading = () => <div role="status">
    <svg aria-hidden="true"
         className="inline w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-gray-600 dark:fill-gray-300"
         viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
            fill="currentColor"/>
        <path
            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
            fill="currentFill"/>
    </svg>
    <span className="sr-only">Loading...</span>
</div>

export const SideBar = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({...props}, ref) => (
    <div
        className="pb-10 dark:bg-gray-900 flex-auto p-3 min-w-80 w-80 max-w-80 overflow-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] flex-col " {...props}
        ref={ref}>
        {props.children}
    </div>

))

export const DataContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({
       className, icon = null, loading = false, error = false, expanded = false, setExpanded = (v) => {
    }, title, subtitle, headerStyle, ...props
   }, ref) => (
    <>

        <div className="flex-grow flex flex-row items-center" {...props}
             ref={ref}>

            <div className="pl-2 flex flex-col flex-grow">

                <div
                    className={cn("flex-grow items-center space-x-1 flex  flex-row  text-gray-800 dark:text-neutral-200", headerStyle)}>

                    <div className="flex flex-col flex-grow">

                        {title}

                        <div className="flex text-xs opacity-60">
                            {loading && <Loading/>}
                            {!loading && !error && subtitle}
                        </div>
                        {error && !loading &&
                            <ExclamationCircleIcon className="size-5 text-black dark:text-white"/>}

                    </div>

                </div>
            </div>


        </div>

        {props.children}

    </>
))
export const Section = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({
       className, Icon = null, loading = false, error = false, expanded = false, setExpanded = (v) => {
    }, title, subtitle, headerStyle, ...props
   }, ref) => (
    <>
        <Button onClick={() => {
            if (props.canExpand) setExpanded(!expanded)
        }}
                className={clsx("pt-1 pb-1 w-80 min-w-80 hover:opacity-100 flex flex-row items-center ", expanded ? "opacity-100" : "")}
                ref={ref}>


            <div className=" flex flex-col flex-grow">

                <div
                    className={cn("pr-1 pl-1 pt-3 pb-3 mr-3 yarn:bg-gray-100 dark:hover:bg-lighten-100 hover:rounded-lg flex-grow items-center space-x-3 flex flex-row text-gray-800 dark:text-neutral-200", headerStyle)}>

                    <div className="flex">
                        {Icon && <Icon className="size-6 fill-blue-400 min-w-6"/>}
                    </div>

                    <div className="flex flex-col flex-grow">

                        <div className="flex text-sm font-bold opacity-95">{title}</div>

                        <div className="flex text-sm opacity-80">
                            {loading && <Loading/>}
                            {!loading && !error && subtitle}
                        </div>
                        {error && !loading &&
                            <ExclamationCircleIcon className="size-5 text-black dark:text-white"/>}

                    </div>

                    {props.canExpand && <div className="flex flex-grow opacity-50 ">
                        {setExpanded && expanded &&
                            <ChevronUpIcon className=" flex mr-3 ml-auto w-4 text-black dark:text-white"/>}
                        {setExpanded && !expanded &&
                            <ChevronDownIcon className="flex mr-3 ml-auto w-4 text-black dark:text-white"/>}
                    </div>}

                </div>
            </div>


        </Button>

        {expanded && <div className="ml-3
         focus:outline-none focus:border-gray-400
         hover:text-lighten-600
         border-gray-400 dark:border-gray-800
        text-sm

        flex flex-col flex-nowrap p-0 text-nowrap
        space-y-2 py-1 ps-4 -ms-px border-s-2">
            {props.children}
        </div>}


    </>
))

export const Item = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({...props}, ref) => (
    <div className={clsx("flex flex-col opacity-70 hover:opacity-100", props.selected?"!opacity-100":"")} ref={ref}>
        {props.children}
    </div>
))
//clsx("border-transparent text-gray-700 focus:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-300 dark:focus:text-neutral-300", vault.path.identifier == path ? "!text-blue-600 !border-blue-600 dark:!border-gray-100 dark:!text-gray-100" : "")

export const Content = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({...props}, ref) => (
    <div
        className="h-screen overflow-y-scroll border-l-2 mr-1 p-2 border-gray-400 dark:border-opacity-20  flex-grow dark:bg-gray-990 bg-gray-100" {...props}
        ref={ref}>
        {props.children}
    </div>
))


export const CommandBar = () => {
    var searchContext = useContext(SearchContext)
    const [page, setPage] = useState<"root" | "projects">("root");
    const [open, setOpen] = useState<boolean>(false);
    const [search, setSearch] = useState("");
    useHandleOpenCommandPalette(setOpen);

    const items = ["FT", "NFT", "Capability", "Storage", "Contract"].filter(name => searchContext[name]).map((item) => {
        return searchContext[item]
    })
    const filteredItems = filterItems(items, search);

    return (
        <CommandPalette
            onChangeSearch={setSearch}
            onChangeOpen={setOpen}
            search={search}
            isOpen={open}
            page={page}
            className="z-40"
        >
            <CommandPalette.Page id="root">
                {filteredItems.length ? (
                    filteredItems.map((list) => (
                        <CommandPalette.List key={list.id} heading={list.heading}>
                            {list.items.map(({id, ...rest}) => (
                                <CommandPalette.ListItem
                                    key={id}
                                    index={getItemIndex(filteredItems, id)}
                                    {...rest}
                                />
                            ))}
                        </CommandPalette.List>
                    ))
                ) : (
                    <CommandPalette.FreeSearchAction/>
                )}
            </CommandPalette.Page>

            <CommandPalette.Page id="projects">
                {/* Projects page */}
            </CommandPalette.Page>
        </CommandPalette>
    );
};

const highlighterTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? vs2015 : a11yLight

export const SyntaxHighlight = ({ ...props}) => <div className={"flex p-0 bg-transparent"}>
    <SyntaxHighlighter
        language="yaml"
        style={highlighterTheme}
        customStyle={{
            overflow: "hidden",
            fontSize: "13px",
            margin: 0,
            padding: 0,
            backgroundColor: "transparent"
        }}
        renderer={({rows, stylesheet, useInlineStyles}) => {
            return (
                <>
                    {rows.map(node => {
                        node = checkNodes(node, node, props.address)
                        const {style, key} = node

                        return createElement({
                            node,
                            stylesheet,
                            style,
                            useInlineStyles,
                            key
                        })
                    })}
                </>
            )
        }}
    >
        {props.data}
    </SyntaxHighlighter></div>
