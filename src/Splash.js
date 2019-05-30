let $ = window.cwrcQuery
if ($ === undefined) {
	let prevJQuery = window.jQuery
	$ = require('jquery')
	window.jQuery = $
	require('bootstrap')
	window.jQuery = prevJQuery
	window.cwrcQuery = $
}

import React, {Fragment} from 'react'
import { Modal, Button } from 'react-bootstrap';

const Splash = (props) => {
    return (
        <Fragment>
            <Modal.Header closeButton={false}>Welcome to CWRC-Writer</Modal.Header>
			<Modal.Body>
                <h4>Welcome to CWRC-Writer, the XML & RDF online editor developed by the <a href="https://cwrc.ca" target="_blank">Canadian Writing Research Collaboratory</a></h4>
                <p>Git-Writer provides light-weight WYSIWYG editing of XML documents and converts, upon request, xml named entities (persons, organization, places, titles) and document annotations (notes, citations, corrections, links) to xml rdf or Json-ld annotations fully compatible with the Web Annotation Data Model.</p>
                <p>You can use CWRC-Writer to lightly edit your XML document, add linked open data capability to it to increase the interoperability of your document, or both.</p>
                <p>Your documents are stored in GitHub, so you will need to login to your GitHub account in order to use CWRC-Writer.</p>
                <p>To learn more about how to use CWRC-Writer, please go to <a href="https://cwrc-writer.cwrc.ca/documentation" target="_blank">cwrc-writer.cwrc.ca/documentation</a>. We recommend that you start with the video tutorial and the quick start guide.</p>
                <p>CWRC-Writer is still under development, so if you run into an issue or there is a feature you would like to see added, please submit a ticket to <a href="https://github.com/cwrc/CWRC-WriterBase/issues" target="_blank">github.com/cwrc/CWRC-WriterBase/issues</a>.</p>
                <p>If you are a developer interested in adopting/adapting the Writer in a different environment, please consult <a href="https://github.com/cwrc/tech_documentation/blob/master/Tools-reference.md#cwrc-writer" target="_blank">this reference</a>. You can also contact us through a GitHub ticket on any of the CWRC-Writer code repositories.</p>
                <hr/>
                <h4>Development Team</h4>
                <p>Andrew MacDonald, 2013-present</p>
                <p>James Chartrand, 2013-2018</p>
                <h4>Management, Q/A Team</h4>
                <p>Susan Brown, 2013-present</p>
                <p>Mihaela Ilovan, 2014-present</p>
                <p>Megan Sellmer, 2013-2016</p>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={props.onContinue} bsStyle="success">Continue</Button>
            </Modal.Footer>
        </Fragment>
    )
}

export default Splash
