import React, { useEffect, useState } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import client from "../../../services/restClient";
import _ from "lodash";
import initilization from "../../../utils/init";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import UploadFilesToS3 from "../../../services/UploadFilesToS3";


const getSchemaValidationErrorsStrings = (errorObj) => {
    let errMsg = {};
    for (const key in errorObj.errors) {
      if (Object.hasOwnProperty.call(errorObj.errors, key)) {
        const element = errorObj.errors[key];
        if (element?.message) {
          errMsg[key] = element.message;
        }
      }
    }
    return errMsg.length ? errMsg : errorObj.message ? { error : errorObj.message} : {};
};

const StudentsCreateDialogComponent = (props) => {
    const [_entity, set_entity] = useState({});
    const [error, setError] = useState({});
    const [loading, setLoading] = useState(false);
    const urlParams = useParams();
    

    useEffect(() => {
        let init  = {};
        if (!_.isEmpty(props?.entity)) {
            init = initilization({ ...props?.entity, ...init }, [], setError);
        }
        set_entity({...init});
        setError({});
    }, [props.show]);

    const validate = () => {
        let ret = true;
        const error = {};
          
            if (_.isEmpty(_entity?.fullname)) {
                error["fullname"] = `Fullname field is required`;
                ret = false;
            }
  
            if (_.isEmpty(_entity?.image)) {
                error["image"] = `Image field is required`;
                ret = false;
            }
        if (!ret) setError(error);
        return ret;
    }

    const onSave = async () => {
        if(!validate()) return;
        let _data = {
            fullname: _entity?.fullname,image: _entity?.image,
            createdBy: props.user._id,
            updatedBy: props.user._id
        };

        setLoading(true);

        try {
            
        const result = await client.service("students").create(_data);
        props.onHide();
        props.alert({ type: "success", title: "Create info", message: "Info Students created successfully" });
        props.onCreateResult(result);
        } catch (error) {
            console.debug("error", error);
            setError(getSchemaValidationErrorsStrings(error) || "Failed to create");
            props.alert({ type: "error", title: "Create", message: "Failed to create in Students" });
        }
        setLoading(false);
    };

    const onFileimageLoaded = (file, status) => {
    if (status)
      props.alert({
        title: "file uploader",
        type: "success",
        message: "file uploaded" + file.name
      });
    else
      props.alert({
        title: "file uploader",
        type: "error",
        message: "file uploader failed" + file.name
      });
  };

    const setimageId = (id) => { setValByKey("image", id);  };

    

    const renderFooter = () => (
        <div className="flex justify-content-end">
            <Button label="save" className="p-button-text no-focus-effect" onClick={onSave} loading={loading} />
            <Button label="close" className="p-button-text no-focus-effect p-button-secondary" onClick={props.onHide} />
        </div>
    );

    const setValByKey = (key, val) => {
        let new_entity = { ..._entity, [key]: val };
        set_entity(new_entity);
        setError({});
    };

    

    return (
        <Dialog header="Create Students" visible={props.show} closable={false} onHide={props.onHide} modal style={{ width: "40vw" }} className="min-w-max scalein animation-ease-in-out animation-duration-1000" footer={renderFooter()} resizable={false}>
            <div className="grid p-fluid overflow-y-auto"
            style={{ maxWidth: "55vw" }} role="students-create-dialog-component">
            <div className="col-12 md:col-6 field">
            <span className="align-items-center">
                <label htmlFor="fullname">Fullname:</label>
                <InputText id="fullname" className="w-full mb-3 p-inputtext-sm" value={_entity?.fullname} onChange={(e) => setValByKey("fullname", e.target.value)}  required  />
            </span>
            <small className="p-error">
            {!_.isEmpty(error["fullname"]) ? (
              <p className="m-0" key="error-fullname">
                {error["fullname"]}
              </p>
            ) : null}
          </small>
            </div>
<div className="col-12 field">
                    <span className="align-items-center">
                        <label htmlFor="image">Image:</label>
                        <UploadFilesToS3 type={'create'} user={props.user} id={urlParams.id} serviceName="students" onUploadComplete={setimageId} onFileLoaded={onFileimageLoaded}/>
                    </span>
                    <small className="p-error">
                    {!_.isEmpty(error["image"]) ? (
                      <p className="m-0" key="error-image">
                        {error["image"]}
                      </p>
                    ) : null}
                  </small>
                    </div>
            <small className="p-error">
                {Array.isArray(Object.keys(error))
                ? Object.keys(error).map((e, i) => (
                    <p className="m-0" key={i}>
                        {e}: {error[e]}
                    </p>
                    ))
                : error}
            </small>
            </div>
        </Dialog>
    );
};

const mapState = (state) => {
    const { user } = state.auth;
    return { user };
};
const mapDispatch = (dispatch) => ({
    alert: (data) => dispatch.toast.alert(data),
});

export default connect(mapState, mapDispatch)(StudentsCreateDialogComponent);
