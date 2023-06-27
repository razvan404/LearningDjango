import React, { Component } from "react";

import JoinRoomPage from "./JoinRoomPage";
import CreateRoomPage from "./CreateRoomPage";
import RoomPage from "./RoomPage";
import InfoPage from "./InfoPage";
import {
    Grid,
    Button,
    ButtonGroup,
    Typography
} from "@material-ui/core";
import { BrowserRouter as Router,
    Routes,
    Route,
    Link,
    Navigate
 } from "react-router-dom";

export default class HomePage extends Component {
    constructor(props) {
        super(props);
        this.state ={
            roomCode: null   
        };
        this.clearRoomCode = this.clearRoomCode.bind(this);
    }

    async componentDidMount() {
        fetch('/api/user-in-room')
           .then((response) => response.json())
           .then((data) => {
                this.setState({
                    roomCode: data.code
                });
           });
        
    }

    renderHomePage() {
        return (
            <Grid container spacing={3} align='center'>
                <Grid item xs={12}>
                    <Typography variant='h3' component='h3'>
                        Music Lobby
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <ButtonGroup disableElevation variant='contained'>
                        <Button color='primary' to='/join' component={Link}>
                            Join a Room
                        </Button>
                        <Button color='default' to='/info' component={Link}>
                            Info
                        </Button>
                        <Button color='secondary' to='/create' component={Link}>
                            Create a Room
                        </Button>
                    </ButtonGroup>
                </Grid>
            </Grid>
        ); 
    }

    clearRoomCode() {
        this.setState({
            roomCode: null
        });
    }

    render() {
        return (
            <Router>
                <Routes>
                    <Route
                        exact
                        path='/'
                        Component={() => {
                            return this.state.roomCode ? (
                                    <Navigate to={`/room/${this.state.roomCode}`} />
                                ) : (
                                    this.renderHomePage()
                                )
                        }}/>
                    <Route path='/join' element={<JoinRoomPage />} />
                    <Route path='/info' element={<InfoPage />} />
                    <Route path='/create' element={<CreateRoomPage />} />
                    <Route path='/room/:roomCode' element={<RoomPage leaveRoomCallback={this.clearRoomCode} />} />
                </Routes>
            </Router>
        );
    }
}
