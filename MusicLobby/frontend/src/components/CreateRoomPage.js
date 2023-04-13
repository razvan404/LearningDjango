import React, { Component } from "react";
import {
    Button,
    Grid,
    Typography,
    TextField,
    FormHelperText,
    FormControl,
    Radio,
    RadioGroup,
    FormControlLabel
 } from "@material-ui/core";
import { Link } from "react-router-dom"
import withRouter from "./withRouter";

class CreateRoomPage extends Component {
    defaultVotes = 2;

    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: true,
            votesToSkip: this.defaultVotes,
        };
        this.handleVotesChanged = this.handleVotesChanged.bind(this);
        this.handleGuestCanPauseChanged = this.handleGuestCanPauseChanged.bind(this);
        this.handleRoomButtonPressed = this.handleRoomButtonPressed.bind(this);
    }

    handleVotesChanged(ev) {
        this.setState({
            votesToSkip: parseInt(ev.target.value)
        });
    }

    handleGuestCanPauseChanged(ev) {
        this.setState({
            guestCanPause: ev.target.value === 'true' ? true : false
        });
    }

    handleRoomButtonPressed() {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause
            })
        };
        fetch('/api/create-room', requestOptions)
            .then((response) =>response.json())
            .then((data) => this.props.navigate('/room/' + data.code));
    }

    render() {
        return (<Grid container spacing={1}>
            <Grid item xs={12} align='center'>
                <Typography component='h4' variant='h4'>
                    Create a Room
                </Typography>                
            </Grid>
            <Grid item xs={12} align='center'>
                <FormControl component='fieldset'>
                    <FormHelperText>
                        <div align='center'>Guest Control of Playback State</div>
                    </FormHelperText>
                    <RadioGroup
                        row
                        defaultValue='true'
                        onChange={ this.handleGuestCanPauseChanged }
                    >
                        <FormControlLabel 
                            value='true'
                            control={<Radio color='primary' />} 
                            label='Play/Pause'
                            labelPlacement='bottom'
                        />
                        <FormControlLabel 
                            value='false'
                            control={<Radio color='secondary' />} 
                            label='No Control'
                            labelPlacement='bottom'
                        />
                    </RadioGroup>
                </FormControl>             
            </Grid>
            <Grid item xs={12} align='center'>
                <FormControl>
                    <TextField 
                        required={true}
                        type='number'
                        defaultValue={this.defaultVotes}
                        inputProps={{
                            min: 1,
                            style: { textAlign: 'center' }
                        }}
                        onChange={this.handleVotesChanged}
                    />
                    <FormHelperText>
                        <div align='center'>Votes Required to Skip Song</div>
                    </FormHelperText>
                </FormControl>
            </Grid>
            <Grid item xs={12} align='center'>
                <Button 
                    color='primary'
                    variant='contained'
                    onClick={ this.handleRoomButtonPressed }
                >Create a Room</Button>
            </Grid>
            <Grid item xs={12} align='center'>
                <Button color='secondary' variant='contained' to='/' component={Link}>Back</Button>
            </Grid>
        </Grid>);
    }
}

export default withRouter(CreateRoomPage);
