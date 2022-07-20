import React from 'react';

export class ErrorBoundary extends React.Component {
  componentDidCatch(error, info){
    if(!error.ignoreBugsnag){
      console.log("ErrorBoundary: ", error, info);
    }
  }
  state = {
    error: null as any
  }
  static getDerivedStateFromError(er){
    return {
      error: er
    }
  }
  render(){
    if(this.state.error){
		
      return <div className='page page-center'>
        <div className='container-tight py-4'>
          <div className='empty'>
            <div className='empty-header'>500</div>
            <p className="empty-title">Oops... You just encountred an error.</p>
            <p className="empty-subtitle text-muted">
            	{
            		this.state.error.errors ?
            			this.state.error.errors[0].message:
            			this.state.error.message		
            	}
            </p>
            <div className="empty-action">
              <button className='btn btn-primary' onClick={() => {
                this.setState({error: null})
              }}>Retry</button>
            </div>
          </div>
        </div>
      </div>;
    }

    return this.props.children;
  }
} 