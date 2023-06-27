import React, { useState } from "react";
import {
    Grid,
    Button,
    Typography,
    IconButton
} from "@material-ui/core";
import { NavigateBefore, NavigateNext } from "@material-ui/icons";
import { Link } from "react-router-dom"

const pages = {
    JOIN: 'pages.join',
    CREATE: 'pages.create'
}

export default function InfoPage(props) {
    const [page, setPage] = useState(pages.JOIN);
    
    function joinInfo() {
        return "Join page";
    }

    function createInfo() {
        return "Create page";
    }

    return (
        <Grid container spacing={1} align='center'>
            <Grid item xs={12}>
                <Typography component='h4' variant='h4'>
                    What is Music Lobby?
                </Typography>
            </Grid>
            <Grid item xs={12}>
                <Typography variant='body1'>
                    { page === pages.JOIN ? joinInfo() : createInfo()}
                </Typography>
                <Grid item xs={12}>
                    <IconButton  onClick={() => {
                        {page === pages.JOIN ? setPage(pages.CREATE) : setPage(pages.JOIN)}
                    }}>
                    {page === pages.JOIN ? <NavigateNext /> : <NavigateBefore />}
                    </IconButton>
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Button color='secondary' variant='contained' to='/' component={Link}>
                    Back
                </Button>
            </Grid>
        </Grid>
    );
}
