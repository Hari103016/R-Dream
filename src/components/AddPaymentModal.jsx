import { useState } from "react";
import { supabase } from "../services/supabase";
import Swal from "sweetalert2";
import "./AddPaymentModal.css";


function AddPaymentModal({ customer, onClose, onSuccess }) {


    const today = new Date()
        .toISOString()
        .split("T")[0];


    const [formData, setFormData] = useState({

        amount: "",

        payment_mode: "Cash",

        remarks: "",

        payment_date: today

    });




    const handleChange = (e) => {


        setFormData({

            ...formData,

            [e.target.name]: e.target.value

        });


    };





    const savePayment = async () => {


        try {



            if (!formData.amount) {


                Swal.fire({

                    title: "Amount Required",

                    text: "Please enter payment amount.",

                    icon: "warning",

                    confirmButtonColor: "#2563eb"

                });


                return;

            }




            const paymentAmount = Number(
                formData.amount
            );





            if (paymentAmount <= 0) {


                Swal.fire({

                    title: "Invalid Amount",

                    text: "Enter a valid payment amount.",

                    icon: "warning",

                    confirmButtonColor: "#2563eb"

                });


                return;

            }





            if (
                paymentAmount >
                Number(customer.balance)
            ) {


                Swal.fire({

                    title: "Payment Error",

                    text: "Payment exceeds remaining balance.",

                    icon: "error",

                    confirmButtonColor: "#ef4444"

                });


                return;

            }






            const { error: paymentError } = await supabase

                .from("payments")

                .insert([

                    {

                        customer_id: customer.id,

                        amount: paymentAmount,

                        payment_mode:
                            formData.payment_mode,

                        remarks:
                            formData.remarks,

                        payment_date:
                            formData.payment_date

                    }

                ]);





            if (paymentError) {


                throw paymentError;


            }
                        // UPDATE CUSTOMER AMOUNT


            const newPaid =

                Number(customer.amount_paid || 0)

                +

                paymentAmount;




            const newBalance = Math.max(

                Number(customer.total_amount || 0)

                -

                newPaid,

                0

            );





            const customerStatus =

                newBalance === 0

                    ? "Sold"

                    : "Booked";






            const { error: customerError } = await supabase

                .from("customers")

                .update({

                    amount_paid: newPaid,

                    balance: newBalance,

                    status: customerStatus

                })

                .eq(

                    "id",

                    customer.id

                );





            if (customerError) {


                throw customerError;


            }







            // UPDATE PLOT STATUS WHEN FULL PAYMENT DONE


            if (newBalance === 0) {



                const {

                    data: updatedPlot,

                    error: plotError

                } = await supabase


                    .from("plots")


                    .update({

                        status: "Sold"

                    })


                    .eq(

                        "plot_no",

                        Number(customer.plot_no)

                    )


                    .select();






                if (plotError) {


                    throw plotError;


                }






                if (

                    !updatedPlot ||

                    updatedPlot.length === 0

                ) {


                    throw new Error(

                        "Plot not found."

                    );


                }


            }







            // CLOSE MODAL FIRST


            onClose();






            // SHOW SUCCESS POPUP AFTER CLOSE


            setTimeout(async () => {



                await Swal.fire({


                    title: "Payment Added Successfully!",


                    text: "Payment record has been saved.",


                    icon: "success",


                    confirmButtonColor: "#2563eb",


                    confirmButtonText: "OK"


                });






                if (onSuccess) {


                    await onSuccess();


                }



            }, 300);






        }


        catch (error) {


            console.error(error);




            Swal.fire({


                title: "Error",


                text: error.message,


                icon: "error",


                confirmButtonColor: "#ef4444"


            });


        }


    };
        return (

        <div className="modal-overlay">


            <div className="payment-modal">


                <h2>
                    Add Payment
                </h2>




                <div className="form-group">

                    <label>
                        Customer
                    </label>


                    <input

                        type="text"

                        value={customer.name}

                        readOnly

                    />

                </div>





                <div className="form-group">

                    <label>
                        Plot Number
                    </label>


                    <input

                        type="text"

                        value={customer.plot_no}

                        readOnly

                    />

                </div>






                <div className="form-group">

                    <label>
                        Remaining Balance
                    </label>


                    <input

                        type="text"

                        value={
                            `₹ ${Number(
                                customer.balance || 0
                            ).toLocaleString("en-IN")}`
                        }

                        readOnly

                    />

                </div>







                <div className="form-group">

                    <label>
                        Amount
                    </label>


                    <input

                        type="number"

                        name="amount"

                        placeholder="Enter Amount"

                        value={formData.amount}

                        onChange={handleChange}

                    />

                </div>







                <div className="form-group">

                    <label>
                        Payment Mode
                    </label>


                    <select

                        name="payment_mode"

                        value={formData.payment_mode}

                        onChange={handleChange}

                    >

                        <option>
                            Cash
                        </option>

                        <option>
                            UPI
                        </option>

                        <option>
                            Bank Transfer
                        </option>

                        <option>
                            Cheque
                        </option>


                    </select>

                </div>







                <div className="form-group">

                    <label>
                        Remarks
                    </label>


                    <input

                        type="text"

                        name="remarks"

                        placeholder="Remarks"

                        value={formData.remarks}

                        onChange={handleChange}

                    />

                </div>







                <div className="form-group">

                    <label>
                        Payment Date
                    </label>


                    <input

                        type="date"

                        name="payment_date"

                        value={formData.payment_date}

                        onChange={handleChange}

                    />

                </div>







                <div className="modal-buttons">


                    <button

                        className="cancel-btn"

                        onClick={onClose}

                    >

                        Cancel

                    </button>





                    <button

                        className="save-btn"

                        onClick={savePayment}

                    >

                        Save Payment

                    </button>


                </div>


            </div>


        </div>

    );


}


export default AddPaymentModal;