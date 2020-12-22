import React, { useState, useEffect } from 'react';
import { Dropdown, Label } from 'semantic-ui-react'

/*
    accessContexts: [<String>]
    liftAccessContext: ()
    accessContext: String
*/
export default function AccessControlDropdown (props) {
    const [accessContext, setAccessContext] = useState("INTRASCHOOL")
    // Lifts new access context whenever there is a change in access context
    useEffect(() => {
        props.liftAccessContext(accessContext)
    }, [accessContext]);
    return (
        <Label basic >Current Context:
            <Dropdown
                compact
                style={
                    {
                        'marginLeft': '5px',
                        'minWidth': '150px'
                    }
                }
                selection
                options={props.accessContexts.map(ac => {
                    return {
                        text: ac,
                        value: ac,
                        key: ac
                    }
                })}
                value={accessContext || props.accessContext}
                onChange={(e, {value}) => setAccessContext(value)}
            />
        </Label>
    )
}