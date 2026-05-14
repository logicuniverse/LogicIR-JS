module logicir_h5_and2(
  input wire a,
  input wire b,
  output wire y
);
  assign y = a & b;
endmodule

module logicir_h5_and3(
  input wire a,
  input wire b,
  input wire c,
  output wire y
);
  wire ab;
  logicir_h5_and2 u_and_ab(.a(a), .b(b), .y(ab));
  logicir_h5_and2 u_and_abc(.a(ab), .b(c), .y(y));
endmodule
