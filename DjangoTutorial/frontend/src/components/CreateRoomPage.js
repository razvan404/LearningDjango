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
    FormControlLabel,
    Collapse
 } from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { Link } from "react-router-dom";
import { withRouter } from "./Utils";

class CreateRoomPage extends Component {
    static defaultProps = {
        votesToSkip: 2,
        guestCanPause: true,
        update: false,
        roomCode: null,
        updateCallback: () => {}
    }

    constructor(props) {
        super(props);
        this.state = {
            guestCanPause: this.props.guestCanPause,
            votesToSkip: this.props.votesToSkip,
            successMsg: '',
            errorMsg: ''
        };
        this.handleVotesChanged = this.handleVotesChanged.bind(this);
        this.handleGuestCanPauseChanged = this.handleGuestCanPauseChanged.bind(this);
        this.handleCreateButtonPressed = this.handleCreateButtonPressed.bind(this);
        this.handleUpdateButtonPressed = this.handleUpdateButtonPressed.bind(this);
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

    handleCreateButtonPressed() {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause
            })
        };
        fetch('/api/create-room', requestOptions)
            .then((response) => response.json())
            .then((data) => this.props.navigate('/room/' + data.code));
    }

    handleUpdateButtonPressed() {
        const requestOptions = {
            method: 'PATCH',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                votes_to_skip: this.state.votesToSkip,
                guest_can_pause: this.state.guestCanPause,
                code: this.props.roomCode
            })
        };
        fetch('/api/update-room', requestOptions)
            .then((response) => {
                if (response.ok) {
                    this.setState({
                        successMsg: 'Room updated successfully!'
                    });
                    this.props.updateCallback();
                } else {
                    this.setState({
                        errorMsg: 'Error updating room...'
                    });
                }
            });
    }

    renderCreateButtons() {
        return (
            <>
            <Grid item xs={12}>
                <Button 
                    color='primary'
                    variant='contained'
                    onClick={ this.handleCreateButtonPressed }
                >Create a Room</Button>
            </Grid>
            <Grid item xs={12}>
                <Button color='secondary' variant='contained' to='/' component={Link}>Back</Button>
            </Grid>
            </>
        );
    }

    renderUpdateButtons() {
        return (
            <Grid item xs={12}>
                <Button 
                    color='primary'
                    variant='contained'
                    onClick={ this.handleUpdateButtonPressed }
                >Update Room</Button>
            </Grid>
        );
    }

    render() {
        const title = this.props.update ? 'Update Room' : 'Create a Room'
        
        return (<Grid container spacing={1} align='center'>
            <Grid item xs={12}>
                <Collapse in={ this.state.successMsg != '' || this.state.errorMsg != '' }>
                    {this.state.successMsg != '' 
                        ? <Alert severity='success' onClose={() => {
                            this.setState({successMsg: ''});
                        }}>{this.state.successMsg}</Alert>
                        : <Alert severity='error' onClose={() => {
                            this.setState({errorMsg: ''});
                        }}>{this.state.errorMsg}</Alert>}
                </Collapse>                
            </Grid>
            <Grid item xs={12}>
                <Typography component='h4' variant='h4'>
                    {title}
                </Typography>                
            </Grid>
            <Grid item xs={12}>
                <FormControl component='fieldset'>
                    <FormHelperText>
                        <div align='center'>Guest Control of Playback State</div>
                    </FormHelperText>
                    <RadioGroup
                        row
                        defaultValue={this.props.guestCanPause.toString()}
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
            <Grid item xs={12}>
                <FormControl>
                    <TextField 
                        required={true}
                        type='number'
                        defaultValue={this.state.votesToSkip}
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
            {this.props.update 
                ? this.renderUpdateButtons() 
                : this.renderCreateButtons()}
        </Grid>);
    }
}

export default withRouter(CreateRoomPage);
