import React, { Component } from "react";

import RoomJoinPage from "./RoomJoinPage";
import CreateRoomPage from "./CreateRoomPage";
import RoomPage from "./RoomPage";

import { BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Redirect
 } from "react-router-dom";

export default class HomePage extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <Router>
                <Routes>
                    <Route exact path='/' element={
                        <p>This is the home page.</p>
                    } />
                    <Route path='/join' Component={RoomJoinPage} />
                    <Route path='/create' Component={CreateRoomPage} />
                    <Route path='/room/:roomCode' element={<RoomPage />} />
                </Routes>
            </Router>
        );
    }
}
