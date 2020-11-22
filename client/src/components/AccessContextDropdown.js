import React, { useState, useEffect } from 'react';
import { Dropdown, Label } from 'semantic-ui-react'

/*
    accessContexts: [<String>]
    liftAccessContext: ()
    accessContext: String
*/
export default function AccessControlDropdown (props) {
    const [accessContext, setAccessContext] = useState("INTERSCHOOL")

    // Lifts new access context whenever there is a change in access context
    useEffect(() => {
        props.liftAccessContext(accessContext)
    }, [accessContext]);
    return (
        <Label basic >Current Context:
            <Dropdown
                compact
                style={{'marginLeft': '5px'}}
                selection
                options={props.accessContexts}
                value={accessContext || props.accessContext}
                onChange={(e, {value}) => setAccessContext(value)}
            />
        </Label>
    )
}