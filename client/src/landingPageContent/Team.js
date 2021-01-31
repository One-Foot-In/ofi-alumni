import React from 'react';
import { Grid, Card, Image } from 'semantic-ui-react'

export default function Team () {
    return (
        <Grid>
            <Grid.Row columns={2}>
                <Grid.Column>
                    <Card>
                        <Image src='https://placedog.net/640/480?random' wrapped ui={false} />
                        <Card.Content>
                        <Card.Header>Matthew</Card.Header>
                        <Card.Meta>
                            <span className='date'>Reverse Engineer</span>
                        </Card.Meta>
                        <Card.Description>
                            Doge is a good boy.
                        </Card.Description>
                        </Card.Content>
                    </Card>
                </Grid.Column>
                <Grid.Column>
                    <Card>
                        <Image src='https://placedog.net/640/480?random' wrapped ui={false} />
                        <Card.Content>
                        <Card.Header>Matthew</Card.Header>
                        <Card.Meta>
                            <span className='date'>Reverse Engineer</span>
                        </Card.Meta>
                        <Card.Description>
                            Doge is a good boy.
                        </Card.Description>
                        </Card.Content>
                    </Card>
                </Grid.Column>
            </Grid.Row>
            <Grid.Row columns={3}>
                <Grid.Column>
                    <Card>
                        <Image src='https://placedog.net/640/480?random' wrapped ui={false} />
                        <Card.Content>
                        <Card.Header>Matthew</Card.Header>
                        <Card.Meta>
                            <span className='date'>Reverse Engineer</span>
                        </Card.Meta>
                        <Card.Description>
                            Doge is a good boy.
                        </Card.Description>
                        </Card.Content>
                    </Card>
                </Grid.Column>
                <Grid.Column>
                    <Card>
                        <Image src='https://placedog.net/640/480?random' wrapped ui={false} />
                        <Card.Content>
                        <Card.Header>Matthew</Card.Header>
                        <Card.Meta>
                            <span className='date'>Reverse Engineer</span>
                        </Card.Meta>
                        <Card.Description>
                            Doge is a good boy.
                        </Card.Description>
                        </Card.Content>
                    </Card>
                </Grid.Column>
                <Grid.Column>
                    <Card>
                        <Image src='https://placedog.net/640/480?random' wrapped ui={false} />
                        <Card.Content>
                        <Card.Header>Matthew</Card.Header>
                        <Card.Meta>
                            <span className='date'>Reverse Engineer</span>
                        </Card.Meta>
                        <Card.Description>
                            Doge is a good boy.
                        </Card.Description>
                        </Card.Content>
                    </Card>
                </Grid.Column>    
            </Grid.Row>
        </Grid>
    )
}