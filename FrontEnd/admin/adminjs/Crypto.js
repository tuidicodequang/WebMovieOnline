export function encodeId(id) {
    // Chuyển ID thành chuỗi
    const idString = id.toString();
    
    // Tạo chuỗi ngẫu nhiên dài 10 ký tự (chỉ bao gồm chữ cái và số)
    let randomString = Math.random().toString(36).substr(2, 10); // .toString(36) chuyển đổi sang dạng base-36 (chữ và số)

    // Tìm vị trí của ID trong chuỗi ngẫu nhiên
    let index = randomString.indexOf(idString);

    // Nếu không tìm thấy ID trong chuỗi ngẫu nhiên thì chèn ID vào một vị trí ngẫu nhiên
    if (index === -1) {
        // Chọn một vị trí ngẫu nhiên trong chuỗi ngẫu nhiên (0 đến 9)
        index = Math.floor(Math.random() * randomString.length);
        // Chèn ID vào vị trí này
        randomString = randomString.slice(0, index) + idString + randomString.slice(index);
    }

    // Số chữ số của ID
    const idLength = idString.length;
    const indexString = index.toString().padStart(1, '0'); // Đảm bảo index có 4 ký tự
    const randomChars = Math.random().toString(36).substr(2, 3); // Tạo 3 ký tự ngẫu nhiên
    const result = `${idLength}${indexString}${randomChars}${randomString}`;

    // Đảm bảo độ dài của chuỗi mã hóa là 15 ký tự
    return result;
}
export function decodeId(encodedString) {
    // Tách số chữ số của ID (chữ số đầu tiên)
    const idLength = parseInt(encodedString[0], 10);
    
    // Chỉ lấy 1 chữ số cho index (chữ số thứ hai)
    const index = parseInt(encodedString[1], 10);
    
    // Kiểm tra tính hợp lệ của idLength và index
    if (isNaN(idLength) || isNaN(index)) {
        return 'Chỉ số không hợp lệ';
    }
    // Kiểm tra xem index có hợp lệ không
    if (index < 0 || index + idLength +5 > encodedString.length) {
        console.log('Index:', index);
        console.log('ID Length + Index:', index + idLength);
        console.log('Encoded String:', encodedString);
        return 'Chỉ số không hợp lệ';
    }
    // Tách ID từ chuỗi ngẫu nhiên dựa trên index và idLength
    const id = encodedString.slice(5+index, 5+index + idLength);
    return id;
}