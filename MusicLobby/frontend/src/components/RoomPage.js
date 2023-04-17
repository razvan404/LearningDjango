import React, { Component } from "react";
import {
    Grid,
    Button,
    Typography
} from "@material-ui/core";
import { withRouter } from "./Utils";

class RoomPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            votesToSkip: 2,
            guestCanPause: false,
            isHost: false
        };
        this.roomCode = this.props.params.roomCode;
        this.getRoomDetails();
        this.leaveButtonPressed = this.leaveButtonPressed.bind(this);
    }

    getRoomDetails() {
        fetch('/api/get-room' + '?code=' + this.roomCode)
            .then((response) => {
                if (!response.ok) {
                    this.props.leaveRoomCallback();
                    this.props.navigate('/');
                }
                return response.json();
            })
            .then((data) => {
                this.setState({
                    votesToSkip: data.votes_to_skip,
                    guestCanPause: data.guest_can_pause,
                    isHost: data.is_host
                })
            });
    }

    leaveButtonPressed() {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }
        fetch('/api/leave-room', requestOptions)
            .then((_response) => {
                this.props.leaveRoomCallback();
                this.props.navigate('/');
            })
    }

    render() {
        return <Grid container spacing={1} align='center'>
            <Grid item xs={12}>
                <Typography variant='h4' component='h4'>
                    Code: { this.roomCode }
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant='h6' component='h6'>
                    Votes: { this.state.votesToSkip }
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant='h6' component='h6'>
                    Guest Can Pause: { this.state.guestCanPause.toString() }
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant='h6' component='h6'>
                    Host: { this.state.isHost.toString() }
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Button variant='contained' color='secondary' onClick={ this.leaveButtonPressed }>
                    Leave Room
                </Button>
            </Grid>
        </Grid>;
    }
}

export default withRouter(RoomPage);