import './App.css'
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import HomePage from "./pages/Home.tsx";
import Account from "./pages/Account.tsx";
import '@mantine/core/styles.css';
import '@fontsource/inter';
import '@fontsource/source-code-pro';

import { SearchContext } from './components/SearchContext.ts';
import {RecoilRoot} from "recoil";
import Transaction from "./pages/Transaction.tsx";


export default function App(){


  return (
      <RecoilRoot>
      <SearchContext.Provider value={{search: {}}}>
      <Router>
          <Switch>
          <Route exact path="/(0x)?:address([0-9a-fA-F]{8,16})" component={Account} />
          <Route exact path="/(0x)?:address([0-9a-fA-F]{8,16})/:domain(cap|ft|nft|storage|public|private|contract)/:path/:uuid" component={Account}/>
          <Route exact path="/(0x)?:address([0-9a-fA-F]{8,16})/:domain(cap|ft|nft|storage|public|private|contract)/:path" component={Account}/>

          <Route exact path="/(0x)?:txId([0-9a-fA-F]{64})" component={Transaction} />

          <Route component={HomePage}/>
      </Switch>
      </Router>
      </SearchContext.Provider>

      </RecoilRoot>

  )

}








