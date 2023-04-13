import React, { Component } from "react";
import {
    TextField,
    Button,
    Grid,
    Typography
} from "@material-ui/core";
import { Link } from "react-router-dom";
import withRouter from "./withRouter";

class JoinRoomPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomCode: '',
            error: ''
        }
        this.handleTextFieldChanged = this.handleTextFieldChanged.bind(this);
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
    }

    handleTextFieldChanged(ev) {
        this.setState({
            roomCode: ev.target.value,
            error: ''
        })
    }

    handleRoomButtonPressed(ev) {
        const requestOptions = {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                code: this.state.roomCode
            })
        }
        fetch('/api/join-room', requestOptions)
            .then((response) => {
                console.log(response);
                if (response.ok) {
                    this.props.navigate(`/room/${this.state.roomCode}`);
                } else {
                    this.setState({ error: 'Room not found' });
                }
            }).catch((error) => {
                console.log(error);
            });
    }

    render() {
        return (
            <Grid container spacing={1} align='center'>
                <Grid item xs={12}>
                    <Typography variant='h4' component='h4'>
                        Join a Room
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <TextField 
                        error={this.state.error}
                        label='Code'
                        placeholder='Enter a Room Code'
                        value={this.state.roomCode}
                        helperText={this.state.error}
                        variant='outlined'
                        onChange={this.handleTextFieldChanged}
                    />
                </Grid>
                <Grid item xs={12}>
                <Button
                        variant='contained'
                        color='primary'
                        onClick={this.handleRoomButtonPressed}
                    >Enter Room</Button>
                </Grid>
                <Grid item xs={12}>
                <Button
                        variant='contained'
                        color='secondary'
                        to='/'
                        component={Link}
                    >Back</Button>
                </Grid>
            </Grid>
        );
    }
}

export default withRouter(JoinRoomPage);