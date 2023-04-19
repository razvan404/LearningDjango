import React, { Component } from "react";
import {
    Grid,
    Typography,
    Card,
    IconButton,
    LinearProgress,
    Collapse
} from "@material-ui/core"
import { 
    PlayArrow,
    SkipNext,
    Pause
} from "@material-ui/icons"
import { Alert } from "@material-ui/lab";

export default class MusicPlayer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorMsg: ''
        }
        this.pauseSong = this.pauseSong.bind(this);
        this.playSong = this.playSong.bind(this);
        this.skipSong = this.skipSong.bind(this);
    }

    pauseSong() {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'}
        }
        fetch('/spotify/pause', requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return response.json();
                }
                else {
                    return null;
                }
            })
            .then((data) => {
                if (data) {
                    this.setState({
                        errorMsg: data.error
                    });
                }
            });
    }

    playSong() {
        const requestOptions = {
            method: 'PUT',
            headers: {'Content-Type': 'application/json'}
        }
        fetch('/spotify/play', requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return response.json();
                }
                else {
                    return null;
                }
            })
            .then((data) => {
                if (data) {
                    this.setState({
                        errorMsg: data.error
                    });
                }
            });
    }

    skipSong() {
        const requestOptions = {
            method: 'POST',
            headers: {'Content-Type': 'application/json'}
        }
        fetch('/spotify/skip', requestOptions)
            .then((response) => {
                if (!response.ok) {
                    return response.json();
                }
                else {
                    return null;
                }})
            .then((data) => {
                if (data) {
                    this.setState({
                        errorMsg: data.error
                    });
                }
            });
    }

    render() {
        if (!this.props.title) {
            return <Typography color='textSecondary' component='h5' variant='h5'>
                The host is offline.
            </Typography>
        }

        const songProgress = (this.props.time / this.props.duration) * 100;

        return (
        <>
            <Collapse in={ this.state.errorMsg != '' }>
                <Alert severity='error' onClose={() => {
                    this.setState({errorMsg: ''});
                }}>
                    {this.state.errorMsg}
                </Alert>
            </Collapse>
            <Card>
                <Grid container align='center' alignItems='center'>
                    <Grid item xs={4}>
                        <img src={this.props.image_url} height='100%' width='100%' />
                    </Grid>
                    <Grid item xs={8}>
                        <Typography component='h5' variant='h5'>
                            { this.props.title }
                        </Typography>
                        <Typography color='textSecondary' variant='subtitle1'>
                            { this.props.artist }
                        </Typography>
                        <div>
                            <IconButton onClick={() => {
                                this.props.is_playing
                                    ? this.pauseSong()
                                    : this.playSong()  
                            }}>
                                {this.props.is_playing 
                                    ? <Pause /> 
                                    : <PlayArrow />}
                            </IconButton>
                            <IconButton onClick={this.skipSong}>
                                <SkipNext />
                            </IconButton>
                        </div>
                        <Typography color='textSecondary' variant='subtitle2'>
                            {this.props.votes} / {this.props.votes_required} skip votes
                        </Typography>
                    </Grid>
                </Grid>
                <LinearProgress variant='determinate' value={songProgress} />
            </Card>
        </>
        );
    }
}