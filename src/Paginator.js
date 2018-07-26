import React, {Component} from 'react'
import { Pagination} from 'react-bootstrap';
import ReactDOM from 'react-dom';

class Paginator extends Component {

	range(start, end) {
		return Array(end - start + 1).fill().map((_, idx) => start + idx)
	}

	getPageItem(page, currentPage, pagingCB, resultComponent) {
		return <Pagination.Item
			key={page}
			onClick={()=>page != currentPage && pagingCB(page, resultComponent)}
			data-page={page}
			active={page===currentPage}>
				{page}
			</Pagination.Item>
	}

	addLinks(currentPage, lastPage, pagingCB, resultComponent) {
		const delta = 2
		const spaceOnEnd = lastPage - currentPage
		let portionofDeltaAvailableOnEnd = (spaceOnEnd >= delta)?delta:spaceOnEnd

		// calculate start delta, adding any extra because current page number is last or second last page
		let deltaToAddToStart = delta - portionofDeltaAvailableOnEnd
		let totalDeltaForStart = delta + deltaToAddToStart
		let startPage = Math.max(currentPage - totalDeltaForStart, 1)

		// calculate end delta, adding any extra because current page number is 1 or 2.
		let deltaToAddToEnd = startPage - currentPage + 2
		let totalDeltaForEnd = delta + deltaToAddToEnd
		let endPage = Math.min(currentPage + totalDeltaForEnd, lastPage)

		let pagesToShow = this.range(startPage, endPage)
		return pagesToShow.map(page=>this.getPageItem(page, currentPage, pagingCB, resultComponent))
	}


	render() {
		const {lastPage, currentPage, pagingCB, resultComponent} = this.props
		return (
			<Pagination>
					<Pagination.Prev onClick={()=>currentPage > 1 && pagingCB(currentPage-1, resultComponent)} disabled={currentPage == 1}/>
					{this.addLinks(currentPage, lastPage, pagingCB, resultComponent)}
					<Pagination.Next onClick={()=>currentPage != lastPage && pagingCB(currentPage+1, resultComponent)} disabled={currentPage == lastPage}/>
			</Pagination>)
	}
}

function showPagination(targetElement, currentPage, lastPage, pagingCallback, reactResultComponentReference) {
	ReactDOM.render(<Paginator pagingCB={pagingCallback} lastPage={lastPage} currentPage={currentPage} resultComponent={reactResultComponentReference}/>, document.getElementById(targetElement))
}

export default showPagination
